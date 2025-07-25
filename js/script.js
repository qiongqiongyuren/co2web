// 碳排放系数 (单位: kg CO2/单位)
const emissionFactors = {
    "无烟煤": 2.50,
    "烟煤": 1.88,
    "褐煤": 0.97,
    "炼焦煤": 2.61,
    "型煤": 2.22,
    "焦炭": 2.61,
    "其它焦化产品": 2.61,
    "原油": 3.02,
    "燃料油": 3.17,
    "汽油": 3.02,
    "柴油": 3.18,
    "一般煤油": 3.03,
    "液化石油气": 3.16,
    "液化天然气": 3.11,
    "石脑油": 3.02,
    "沥青": 3.31,
    "润滑油": 3.09,
    "石油焦": 3.18,
    "石化原料油": 3.09,
    "其他油品": 3.09,
    "天然气": 21.62,
    "炼厂干气": 26.11,
    "焦炉煤气": 8.36,
    "管道煤气": 5.00,
    "净外购电量": 790,  // 0.79吨CO2/MWh = 790kg CO2/10⁴ kW·h
    "净外购热力": 100,   // 100 kgCO₂e/GJ
    "汽油车辆总行驶里程": 0.25, // 0.25 kg CO2/km
    "汽油消耗量": 2.35 // 2.35 kg CO2/L
};

// 历史数据存储
let historyData = JSON.parse(localStorage.getItem('carbonHistory')) || [];
let buildingArea = JSON.parse(localStorage.getItem('buildingArea')) || null;
let staffCount = JSON.parse(localStorage.getItem('staffCount')) || null;

// 碳排放数据
const carbonData = {
    categories: [
        {
            name: '燃烧,汽车',
            subcategories: [
                {
                    name: '固体燃料',
                    items: [
                        { name: '无烟煤', unit: 't' },
                        { name: '烟煤', unit: 't' },
                        { name: '褐煤', unit: 't' },
                        { name: '炼焦煤', unit: 't' },
                        { name: '型煤', unit: 't' },
                        { name: '焦炭', unit: 't' },
                        { name: '其它焦化产品', unit: 't' }
                    ]
                },
                {
                    name: '液体燃料',
                    items: [
                        { name: '原油', unit: 't' },
                        { name: '燃料油', unit: 't' },
                        { name: '汽油', unit: 't' },
                        { name: '柴油', unit: 't' },
                        { name: '一般煤油', unit: 't' },
                        { name: '液化石油气', unit: 't' },
                        { name: '液化天然气', unit: 't' },
                        { name: '石脑油', unit: 't' },
                        { name: '沥青', unit: 't' },
                        { name: '润滑油', unit: 't' },
                        { name: '石油焦', unit: 't' },
                        { name: '石化原料油', unit: 't' },
                        { name: '其他油品', unit: 't' }
                    ]
                },
                {
                    name: '气体燃料',
                    items: [
                        { name: '天然气', unit: 'm³' },
                        { name: '炼厂干气', unit: 'm³' },
                        { name: '焦炉煤气', unit: 'm³' },
                        { name: '管道煤气', unit: 'm³' }
                    ]
                },
                {
                    name: '移动源燃烧',
                    items: [
                        { name: '汽油车辆总行驶里程', unit: 'km' },
                        { name: '汽油消耗量', unit: 'L' }
                    ]
                }
            ]
        },
        {
            name: '购电,购热',
            subcategories: [
                {
                    name: '外购能源',
                    items: [
                        { name: '净外购电量', unit: '10⁴ kW·h' },
                        { name: '净外购热力', unit: 'GJ' }
                    ]
                }
            ]
        },
        {
            name: '单位面积相关',
            subcategories: [
                {
                    name: '强度计算基数',
                    items: [
                        { name: '机关单位建筑面积', unit: 'm²' },
                        { name: '机关人员数量', unit: '人' }
                    ]
                },
                {
                    name: '碳汇',
                    items: [
                        { name: '园区内绿地面积', unit: '公顷' }
                    ]
                }
            ]
        }
    ]
};

let currentNavLevel = 0;
let currentCategory = null;

// 显示主分类
function showCategories() {
    const navContent = document.getElementById('navContent');
    navContent.innerHTML = '';
    document.getElementById('navTitle').textContent = '碳排放核算体系';
    document.getElementById('backBtn').style.display = 'none';
    currentNavLevel = 0;
    currentCategory = null;

    // 添加历史数据按钮
    const historyBtn = document.createElement('button');
    historyBtn.className = 'nav-item history-btn';
    historyBtn.textContent = '历史数据';
    historyBtn.addEventListener('click', showHistory);
    navContent.appendChild(historyBtn);

    carbonData.categories.forEach(category => {
        const item = document.createElement('button');
        item.className = 'nav-item nav-btn';
        item.textContent = category.name;
        item.addEventListener('click', () => {
            showSubcategories(category);
        });
        navContent.appendChild(item);
    });
}

// 显示历史数据
function showHistory() {
    const navContent = document.getElementById('navContent');
    navContent.innerHTML = '';
    document.getElementById('navTitle').textContent = '历史数据';
    document.getElementById('backBtn').style.display = 'block';
    currentNavLevel = 3;
    
    // 创建两栏布局
    const container = document.createElement('div');
    container.className = 'history-container';
    
    // 左侧栏 - 分类碳排放
    const leftColumn = document.createElement('div');
    leftColumn.className = 'history-column';
    
    // 右侧栏 - 总碳排放和特殊数据
    const rightColumn = document.createElement('div');
    rightColumn.className = 'history-column';
    
    if (historyData.length === 0) {
        leftColumn.innerHTML = '<p>暂无分类碳排放数据</p>';
    } else {
        // 显示分类碳排放
        historyData.forEach(record => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <p><strong>${record.item}</strong>: ${record.value}${record.unit}</p>
                <p>碳排放: ${record.emission.toFixed(2)}kg CO2</p>
                <p class="history-date">${record.date}</p>
            `;
            leftColumn.appendChild(item);
        });
    }
    
    // 计算总碳排放
    const totalEmission = historyData.reduce((sum, record) => sum + record.emission, 0);
    
    // 显示总碳排放
    const totalDiv = document.createElement('div');
    totalDiv.className = 'total-emission';
    totalDiv.innerHTML = `
        <h3>总碳排放</h3>
        <p>${totalEmission.toFixed(2)} kg CO2</p>
    `;
    rightColumn.appendChild(totalDiv);
    
    // 显示机关单位建筑面积
    const areaDiv = document.createElement('div');
    areaDiv.className = 'special-data';
    areaDiv.innerHTML = `
        <h3>机关单位建筑面积</h3>
        <p>${buildingArea ? buildingArea.value + buildingArea.unit : '未输入'}</p>
        <button class="update-btn" data-type="buildingArea">更新</button>
    `;
    rightColumn.appendChild(areaDiv);
    
    // 显示机关人员数量
    const staffDiv = document.createElement('div');
    staffDiv.className = 'special-data';
    staffDiv.innerHTML = `
        <h3>机关人员数量</h3>
        <p>${staffCount ? staffCount.value + staffCount.unit : '未输入'}</p>
        <button class="update-btn" data-type="staffCount">更新</button>
    `;
    rightColumn.appendChild(staffDiv);
    
    // 添加更新按钮事件
    rightColumn.querySelectorAll('.update-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            const item = type === 'buildingArea' ? 
                {name: '机关单位建筑面积', unit: 'm²'} : 
                {name: '机关人员数量', unit: '人'};
                
            const input = prompt(`请输入${item.name}(单位:${item.unit}):`);
            if (input && !isNaN(input)) {
                const value = parseFloat(input);
                const data = {
                    value: value,
                    unit: item.unit,
                    date: new Date().toLocaleString()
                };
                
                if (type === 'buildingArea') {
                    buildingArea = data;
                    localStorage.setItem('buildingArea', JSON.stringify(buildingArea));
                } else {
                    staffCount = data;
                    localStorage.setItem('staffCount', JSON.stringify(staffCount));
                }
                
                showHistory(); // 刷新显示
            }
        });
    });
    
    // 添加导出按钮
    const exportBtn = document.createElement('button');
    exportBtn.className = 'nav-item export-btn';
    exportBtn.textContent = '导出为Markdown';
    exportBtn.addEventListener('click', exportToMarkdown);
    rightColumn.appendChild(exportBtn);
    
    container.appendChild(leftColumn);
    container.appendChild(rightColumn);
    navContent.appendChild(container);
}

// 导出为Markdown
function exportToMarkdown() {
    let markdown = '# 碳排放历史数据\n\n';
    markdown += '| 项目 | 数量 | 单位 | 碳排放(kg CO2) | 日期 |\n';
    markdown += '|------|------|------|----------------|------|\n';
    
    historyData.forEach(record => {
        markdown += `| ${record.item} | ${record.value} | ${record.unit} | ${record.emission.toFixed(2)} | ${record.date} |\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `碳排放数据_${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 显示子分类
function showSubcategories(category) {
    const navContent = document.getElementById('navContent');
    navContent.innerHTML = '';
    document.getElementById('navTitle').textContent = category.name;
    document.getElementById('backBtn').style.display = 'block';
    currentNavLevel = 1;
    currentCategory = category;

    category.subcategories.forEach(subcategory => {
        const item = document.createElement('button');
        item.className = 'nav-item nav-btn';
        item.textContent = subcategory.name;
        item.addEventListener('click', () => {
            showItems(subcategory);
        });
        navContent.appendChild(item);
    });
}

// 显示数据项
function showItems(subcategory) {
    const navContent = document.getElementById('navContent');
    navContent.innerHTML = '';
    document.getElementById('navTitle').textContent = subcategory.name;
    currentNavLevel = 2;

    // 为“移动源燃烧”提供特殊处理
    if (subcategory.name === '移动源燃烧') {
        const container = document.createElement('div');
        
        // 里程计算部分
        const mileageItem = subcategory.items.find(i => i.name === '汽油车辆总行驶里程');
        if (mileageItem) {
            const mileageDiv = document.createElement('div');
            mileageDiv.className = 'special-data';
            mileageDiv.innerHTML = `
                <h3>按里程计算</h3>
                <p>请输入总行驶里程 (km):</p>
                <input type="number" id="mileageInput" placeholder="公里数">
                <button class="update-btn" id="calcMileageBtn">计算</button>
            `;
            container.appendChild(mileageDiv);
        }

        // 油耗计算部分
        const consumptionItem = subcategory.items.find(i => i.name === '汽油消耗量');
        if (consumptionItem) {
            const consumptionDiv = document.createElement('div');
            consumptionDiv.className = 'special-data';
            consumptionDiv.innerHTML = `
                <h3>按油耗计算</h3>
                <p>请输入汽油消耗量 (L):</p>
                <input type="number" id="consumptionInput" placeholder="升">
                <button class="update-btn" id="calcConsumptionBtn">计算</button>
            `;
            container.appendChild(consumptionDiv);
        }
        
        navContent.appendChild(container);

        // 添加事件监听器
        const calcMileageBtn = document.getElementById('calcMileageBtn');
        if (calcMileageBtn) {
            calcMileageBtn.addEventListener('click', () => {
                const input = document.getElementById('mileageInput').value;
                handleCalculation(mileageItem, input);
            });
        }

        const calcConsumptionBtn = document.getElementById('calcConsumptionBtn');
        if (calcConsumptionBtn) {
            calcConsumptionBtn.addEventListener('click', () => {
                const input = document.getElementById('consumptionInput').value;
                handleCalculation(consumptionItem, input);
            });
        }

    } else {
        // 其他分类的通用处理
        subcategory.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'special-data'; // 使用相同的样式类
            itemDiv.innerHTML = `
                <h3>${item.name}</h3>
                <p>请输入数量 (单位:${item.unit}):</p>
                <input type="number" id="input-${item.name.replace(/\s/g, '')}" placeholder="数量">
                <button class="update-btn" data-item-name="${item.name}">计算</button>
            `;
            navContent.appendChild(itemDiv);
        });

        // 为新创建的计算按钮添加事件监听器
        navContent.querySelectorAll('.update-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemName = e.target.dataset.itemName;
                const item = subcategory.items.find(i => i.name === itemName);
                if (item) {
                    const inputId = `input-${itemName.replace(/\s/g, '')}`;
                    const input = document.getElementById(inputId).value;
                    handleCalculation(item, input);
                }
            });
        });
    }
}

// 通用计算和历史记录函数
function handleCalculation(item, input) {
    if (input && !isNaN(input)) {
        const value = parseFloat(input);
        const factor = emissionFactors[item.name];
        if (factor) {
            const emission = value * factor;
            const record = {
                item: item.name,
                value: value,
                unit: item.unit,
                emission: emission,
                date: new Date().toLocaleString()
            };
            historyData.push(record);
            localStorage.setItem('carbonHistory', JSON.stringify(historyData));
            document.getElementById('unitDisplay').textContent = 
                `${item.name}: ${value}${item.unit} = ${emission.toFixed(2)}kg CO2`;
            
            // 短暂显示结果后清空
            setTimeout(() => {
                document.getElementById('unitDisplay').textContent = '';
            }, 5000);
        } else {
            alert('未找到对应的排放因子！');
        }
    } else {
        alert('请输入有效的数字！');
    }
}

// 返回按钮功能
document.getElementById('backBtn').addEventListener('click', () => {
    if (currentNavLevel === 2) {
        showSubcategories(currentCategory);
    } else if (currentNavLevel === 1) {
        showCategories();
    } else if (currentNavLevel === 3) {
        showCategories();
    }
});

// 初始化
showCategories();
