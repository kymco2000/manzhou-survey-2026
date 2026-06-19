// dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // Check Admin Mode - only allow if admin key is present (optional security for dashboard)
    const ADMIN_SECRET = 'manzhou2026';
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === ADMIN_SECRET;

    if (!isAdminMode) {
        document.body.innerHTML = '<div style="color:white; text-align:center; margin-top:50px;"><h2>存取被拒絕 Access Denied</h2><p>您沒有權限檢視此頁面。</p><a href="index.html" style="color:#10b981;">返回首頁</a></div>';
        return;
    }

    // Base Mock Data (same as survey.js to maintain consistency)
    const baseRecords = [];
    for (let i = 0; i < 248; i++) {
        const seed = Math.random();
        let q1 = seed > 0.6 ? 5 : (seed > 0.36 ? 4 : (seed > 0.16 ? 3 : (seed > 0.05 ? 2 : 1)));
        let q2 = seed > 0.72 ? 5 : (seed > 0.5 ? 4 : (seed > 0.3 ? 3 : (seed > 0.1 ? 2 : 1)));
        let q3 = seed > 0.55 ? 5 : (seed > 0.35 ? 4 : (seed > 0.15 ? 3 : (seed > 0.05 ? 2 : 1)));
        let q4 = seed > 0.6 ? 5 : (seed > 0.38 ? 4 : (seed > 0.18 ? 3 : (seed > 0.05 ? 2 : 1)));
        let q5 = seed > 0.9 ? 5 : (seed > 0.75 ? 4 : (seed > 0.5 ? 3 : (seed > 0.2 ? 2 : 1)));
        let q6 = seed > 0.7 ? 5 : (seed > 0.45 ? 4 : (seed > 0.25 ? 3 : (seed > 0.1 ? 2 : 1)));
        let q7 = seed > 0.85 ? 5 : (seed > 0.6 ? 4 : (seed > 0.4 ? 3 : (seed > 0.15 ? 2 : 1)));
        let q8 = seed > 0.6 ? 5 : (seed > 0.36 ? 4 : (seed > 0.16 ? 3 : (seed > 0.05 ? 2 : 1)));

        baseRecords.push({ q1, q2, q3, q4, q5, q6, q7, q8 });
    }

    // Load Local Storage Data
    const localSurveys = JSON.parse(localStorage.getItem('manzhou_surveys') || '[]');
    const allRecords = [...baseRecords, ...localSurveys];
    const totalCount = allRecords.length;

    // Categories
    const categoryLabels = {
        q1: '🏛️ 鄉公所行政效能與資訊透明度',
        q2: '🏥 偏鄉醫療與長者長照交通接送',
        q3: '🛣️ 聯外交通改善與鄉內道路維護',
        q4: '⛈️ 颱風預防性撤村安置與防災',
        q5: '🌲 墾丁國家公園土地與建管管制',
        q6: '🌊 佳樂水風景區維護與委外營運',
        q7: '🌌 火箭發射場生態與環境評估',
        q8: '🚀 火箭發射場觀光與發展期待'
    };

    // Calculate Averages
    const averages = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0 };
    allRecords.forEach(rec => {
        averages.q1 += rec.q1;
        averages.q2 += rec.q2;
        averages.q3 += rec.q3;
        averages.q4 += rec.q4;
        averages.q5 += rec.q5;
        averages.q6 += rec.q6;
        averages.q7 += rec.q7;
        averages.q8 += rec.q8;
    });

    let highestCat = 'q1';
    let lowestCat = 'q1';
    let maxAvg = 0;
    let minAvg = 5;

    Object.keys(averages).forEach(k => {
        let avg = averages[k] / totalCount;
        averages[k] = avg;
        
        if (avg > maxAvg) { maxAvg = avg; highestCat = k; }
        if (avg < minAvg) { minAvg = avg; lowestCat = k; }
    });

    // Update KPIs
    document.getElementById('kpi-total-users').innerText = totalCount;
    document.getElementById('kpi-highest-cat').innerText = categoryLabels[highestCat].substring(3); // Remove emoji for cleaner look
    document.getElementById('kpi-highest-score').innerText = `${maxAvg.toFixed(2)} / 5.0`;
    document.getElementById('kpi-lowest-cat').innerText = categoryLabels[lowestCat].substring(3);
    document.getElementById('kpi-lowest-score').innerText = `${minAvg.toFixed(2)} / 5.0`;

    // Render Bar Charts
    const barChartsContainer = document.getElementById('dashboard-bar-charts');
    barChartsContainer.innerHTML = '';
    
    Object.keys(categoryLabels).forEach(k => {
        const avg = averages[k];
        const pct = (avg / 5) * 100;
        
        const item = document.createElement('div');
        item.className = 'chart-item';
        item.innerHTML = `
            <div class="chart-item-header">
                <span class="chart-label">${categoryLabels[k]}</span>
                <span class="chart-value">${avg.toFixed(2)} / 5.0</span>
            </div>
            <div class="bar-track">
                <div class="bar-fill" style="width: 0%;"></div>
            </div>
        `;
        barChartsContainer.appendChild(item);
        
        setTimeout(() => {
            const fill = item.querySelector('.bar-fill');
            if (fill) fill.style.width = `${pct}%`;
        }, 100);
    });

    // Render Pie Charts
    const pieChartsGrid = document.getElementById('dashboard-pie-grid');
    pieChartsGrid.innerHTML = '';
    
    Object.keys(categoryLabels).forEach(k => {
        const label = categoryLabels[k];
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        allRecords.forEach(rec => {
            if(rec[k]) {
                distribution[rec[k]]++;
            }
        });
        
        const rates = {
            vs: ((distribution[5] / totalCount) * 100) || 0,
            s: ((distribution[4] / totalCount) * 100) || 0,
            n: ((distribution[3] / totalCount) * 100) || 0,
            u: ((distribution[2] / totalCount) * 100) || 0,
            vu: ((distribution[1] / totalCount) * 100) || 0
        };
        
        const vsEnd = rates.vs;
        const sEnd = vsEnd + rates.s;
        const nEnd = sEnd + rates.n;
        const uEnd = nEnd + rates.u;
        
        const gradientStr = `
            #059669 0% ${vsEnd.toFixed(1)}%, 
            #10b981 ${vsEnd.toFixed(1)}% ${sEnd.toFixed(1)}%, 
            #34d399 ${sEnd.toFixed(1)}% ${nEnd.toFixed(1)}%, 
            #f59e0b ${nEnd.toFixed(1)}% ${uEnd.toFixed(1)}%, 
            #ef4444 ${uEnd.toFixed(1)}% 100%
        `;
        
        const pieContainer = document.createElement('div');
        pieContainer.className = 'question-pie-container';
        pieContainer.innerHTML = `
            <div class="question-pie-title">${label}</div>
            <div class="pie-chart-wrapper">
                <div class="pie-chart" style="--pie-segments: ${gradientStr};"></div>
                <div class="chart-legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #059669;"></div>
                        <div class="legend-label">5分:</div>
                        <div class="legend-percent">${rates.vs.toFixed(1)}% <span style="color:#6b7280; font-size:0.75rem;">(${distribution[5]}人)</span></div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #10b981;"></div>
                        <div class="legend-label">4分:</div>
                        <div class="legend-percent">${rates.s.toFixed(1)}% <span style="color:#6b7280; font-size:0.75rem;">(${distribution[4]}人)</span></div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #34d399;"></div>
                        <div class="legend-label">3分:</div>
                        <div class="legend-percent">${rates.n.toFixed(1)}% <span style="color:#6b7280; font-size:0.75rem;">(${distribution[3]}人)</span></div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #f59e0b;"></div>
                        <div class="legend-label">2分:</div>
                        <div class="legend-percent">${rates.u.toFixed(1)}% <span style="color:#6b7280; font-size:0.75rem;">(${distribution[2]}人)</span></div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #ef4444;"></div>
                        <div class="legend-label">1分:</div>
                        <div class="legend-percent">${rates.vu.toFixed(1)}% <span style="color:#6b7280; font-size:0.75rem;">(${distribution[1]}人)</span></div>
                    </div>
                </div>
            </div>
        `;
        pieChartsGrid.appendChild(pieContainer);
    });
});
