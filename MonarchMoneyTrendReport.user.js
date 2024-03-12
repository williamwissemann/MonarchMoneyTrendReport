// ==UserScript==
// @name         Monarch Money Trend Report
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Enhance Sankey information into Trend format
// @author       Robert
// @match        https://app.monarchmoney.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=monarchmoney.com
// @grant        none
// ==/UserScript==

let r_Init = false;
let SaveLocationPathName = "";

let TrendActive = false;
let TrendStartP = "";
let TrendEndP = "";
let TrendButton = null;
let TrendButtonP = null;
let TrendButtonA = null;
let TrendButtonC = '';
let ShareButton = null;

const css_green = 'color:rgb(25,210,165)';
const css_currency = 'USD';

let css_table0 = 'hvKFU0';
let css_table1 = 'jznQAl';
let css_table2 = 'eGiVnj';
let css_grid = 'jLxdcY';
let css_items = 'eqYSVV';
let css_itemsB = 'HcakD';
let css_itemsD = 'dhlTnX';

let TrendQueue = [];

function Sankey_Trends(InExec) {

    let CI_n = 0;
    let CE_n = 0;
    let LI_n = 0;
    let LE_n = 0;

    switch (InExec) {
        case 1:
            TrendQueue = [];
            Trend_BuildCurrent(1);
            Trend_SetButton();
            break;
        case 2:
            Trend_BuildCurrent(2);
            Trend_BreakdownReport();
            Sankey_HideTrends();
            break;
    }

    function Trend_BreakdownReport() {

        let Hrow = null;
        let row = null;
        let useStyle = "";



        TrendQueue.sort((a, b) => b.N_CURRENT - a.N_CURRENT);

        Hrow = Trend_TableC('.Row__Root-sc-18oidwc-0','.Column__Root-r51fj9-0');

        row = Trend_Table1(Hrow,'','Income','Comparison','This Period','Difference');
        row = Trend_DumpData(row,"Income");
        row = Trend_Table1(Hrow,'','Expenses','','','');
        row = Trend_DumpData(row,"Expense");

        let LS_n = LI_n - LE_n;
        let CS_n = CI_n - CE_n;
        let DS_n = CS_n - LS_n;
        let LS = LS_n.toLocaleString("en-US", {style:"currency", currency:css_currency});
        let CS = CS_n.toLocaleString("en-US", {style:"currency", currency:css_currency});
        let DS = DS_n.toLocaleString("en-US", {style:"currency", currency:css_currency});
        if (DS_n > 0) {
            useStyle = css_green;
        }
        row = Trend_Table1(Hrow,useStyle,'Savings',LS,CS,DS);
        TrendActive = true;
    }

    function Trend_DumpData(InRow,InType) {

        let row = InRow;
        let difamt = "";
        let difamt_n = 0;
        let useStyle = "";

        for (let i = 0; i < TrendQueue.length; i++) {
            if(TrendQueue[i].TYPE == InType) {
                useStyle = "";
                difamt_n = TrendQueue[i].N_CURRENT - TrendQueue[i].N_LAST;
                difamt = difamt_n.toLocaleString("en-US", {style:"currency", currency: css_currency})
                switch (TrendQueue[i].TYPE) {
                    case "Income":
                        if(difamt_n > 0) {
                            useStyle = css_green;
                        };
                        row = Trend_Table4(row,useStyle,TrendQueue[i].DESC,TrendQueue[i].LAST,TrendQueue[i].CURRENT,difamt);
                        CI_n += TrendQueue[i].N_CURRENT;
                        LI_n += TrendQueue[i].N_LAST;
                        break;
                    case "Expense":
                        if(difamt_n <= 0) {
                            useStyle = css_green;
                        }
                        CE_n += TrendQueue[i].N_CURRENT;
                        LE_n += TrendQueue[i].N_LAST;
                        row = Trend_Table4(row,useStyle,TrendQueue[i].DESC,TrendQueue[i].LAST,TrendQueue[i].CURRENT,difamt);
                        break;
                }
            }
        }
        return row;
    }

    function Trend_Table4(InRow,InStyle,a,b,c,d) {

        let div = document.createElement('div');
        div.setAttribute('class', css_items);
        let el = InRow.appendChild(div);

        div = document.createElement('span');
        div.setAttribute('style', 'width: 40%;');
        div.innerHTML = a;
        let elx = el.appendChild(div);
        if(TrendStartP != "") {
            div = document.createElement('span');
            div.setAttribute('style', 'text-align: right; width: 20%;');
            div.setAttribute('class', css_itemsD);
            div.innerHTML = b;
            elx = el.appendChild(div);
        }
        div = document.createElement('span');
        div.setAttribute('style', 'text-align:right; width: 20%;');
        div.setAttribute('class', css_itemsD);
        div.innerHTML = c;
        elx = el.appendChild(div);
        if(TrendStartP != "") {
            div = document.createElement('span');
            div.setAttribute('style', 'text-align:right; width: 20%; ' + InStyle);
            div.setAttribute('class', css_itemsD);
            div.innerHTML = d;
            elx = el.appendChild(div);
        }
        return InRow;
    }

    function Trend_Table1(InRow,InStyle,a,b,c,d) {

        let div = document.createElement('div');
        div.setAttribute('class', css_table2);
        let el = InRow.appendChild(div);

        let elx = Trend_Table1W(el,a,'width: 40%;');
        if(TrendStartP != "") {
            elx = Trend_Table1W(el,b,'font-size: 16px; text-align: right; width: 20%;')
        }
        elx = Trend_Table1W(el,c,'font-size: 16px; text-align:right; width: 20%;');
        if(TrendStartP != "") {
            elx = Trend_Table1W(el,d,'font-size: 16px; text-align:right; width: 20%; ' + InStyle);
        }
        div = document.createElement('div');
        div.setAttribute('class', css_grid);
        elx = InRow.appendChild(div);
        return elx;
    }

    function Trend_Table1W(InRow,abcd,InStyle) {

        let div = document.createElement('span');
        div.setAttribute('class',css_itemsB);
        div.setAttribute('style', InStyle);
        div.innerHTML = abcd;
        return InRow.appendChild(div);
    }

    function Trend_TableC(InStart,InRemove) {
        const elements = document.querySelectorAll(InRemove);
        for (const el of elements) {
            el.remove();
        }
        const elements2 = document.querySelector('span.CardTitle-sc-1yuvwox-0');
        if(TrendStartP == "") {
            elements2.innerHTML = 'Net Income Trend Report';
        } else {
            elements2.innerHTML = 'Net Income Trend Report (Compared to ' + TrendStartP + ' - ' + TrendEndP + ')';
        }
        let el = document.querySelector(InStart);
        el.setAttribute('style','display:contents;');

        let div = document.createElement('div');
        div.setAttribute('class', css_table0);
        let elx = el.appendChild(div);
        div = document.createElement('div');
        div.setAttribute('class', css_table1);
        div.setAttribute('style', 'display:flow-root;');
        el = elx.appendChild(div);
        return el;
    }

    function Trend_SetButton() {
        const element=document.getElementById('date-picker-input--start');
        TrendStartP = element.getAttribute("value").trim();
        const element2=document.getElementById('date-picker-input--end');
        TrendEndP = element2.getAttribute("value").trim();
        TrendButtonP.textContent = "Trend Compare +";
        alert('Trend Report Comparison Loaded:\n\nStart Date: ' + TrendStartP + '\n\nEnd Date: ' + TrendEndP + '\n\nSelect another period and run Trend Report.');
    }

    // not used, but sets date range to exact period last year for single click run (does not work)
    function Trend_SetPast() {
        const element=document.getElementById('date-picker-input--start');
        let Start_Date = element.getAttribute("value").trim();
        const element2=document.getElementById('date-picker-input--end');
        let End_Date = element2.getAttribute("value").trim();
        if(Start_Date != null && End_Date != null) {
            let Start_Year = Number(Start_Date.slice(-4)) -1;
            let End_Year = Number(End_Date.slice(-4)) -1;
            let New_Start = Start_Date.substring(0,6) + Start_Year;
            let New_End = End_Date.substring(0,6) + End_Year;
            element.value = New_Start;
            element2.value = New_End;
        }
    }

    function Trend_UpdateQueue(InAnchor,InDesc,InAmount,InCuramount) {
        let update=false;
        for (let i = 0; i < TrendQueue.length; i++) {
            if(TrendQueue[i].TYPE == InAnchor && TrendQueue[i].DESC == InDesc) {
                TrendQueue[i].CURRENT = InAmount;
                TrendQueue[i].N_CURRENT = InCuramount;
                update=true;
                break;
            }
        }
        if(update == false){
            TrendQueue.push({"TYPE": InAnchor,"DESC": InDesc,"CURRENT": InAmount,"N_CURRENT": InCuramount,"LAST": "", "N_LAST": 0});
        }
    }

    function Trend_BuildCurrent(InExec) {
        const elements=document.querySelectorAll('g.node');
        if(elements) {
            for (const el of elements) {
                let d_anchor = "";
                let d_desc = "";
                let d_amount = "";
                let d_rawamount = "";
                let d_curamount = 0;
                const nodeList = el.childNodes;
                for (const elc of nodeList) {
                    if(elc.getAttribute("text-anchor") != null) {d_anchor = elc.getAttribute("text-anchor")};
                    if(elc.getAttribute("class") == "node-label") {d_desc = elc.innerHTML.trimStart()};
                    if(elc.getAttribute("class") == "fs-exclude") {d_amount = elc.innerHTML.trimStart()};
                }
                if(d_amount != "") {
                    let d_rawamount = d_amount.slice(1);
                    let ndx = d_rawamount.indexOf("(");
                    d_rawamount = d_rawamount.slice(0,ndx-1);
                    d_rawamount = d_rawamount.replace(/,/g,"");
                    d_rawamount = d_rawamount.trim();
                    d_curamount = Number(d_rawamount);
                }
                if(d_amount != "") {
                    if(d_anchor == 'start') { d_anchor = 'Income' } else { d_anchor = 'Expense'} ;
                    if(d_desc == "Savings") {d_anchor = "Savings"};
                    if(InExec == 1) {
                        TrendQueue.push({"TYPE": d_anchor,"DESC": d_desc,"CURRENT": "","N_CURRENT": 0,"LAST": d_amount, "N_LAST": d_curamount});
                    }
                    if(InExec == 2) {
                        Trend_UpdateQueue(d_anchor,d_desc,d_amount,d_curamount);
                    }
                }
            }
        }
    }
}

function Sankey_UnhideTrends() {

    if(document.querySelector('button.TrendButton') == null) {
        let BMode = document.querySelector('button.DefaultButton-sc-13c1sod-0');
        if(BMode != null) {
            TrendButtonC = BMode.className;
            TrendButtonC.replace('btn-active', '');
        }

        TrendButtonP = document.createElement('button');
        TrendButtonP.textContent = 'Trend Compare';
        TrendButtonP.className = 'TrendButton ' + TrendButtonC;
        ShareButton.after(TrendButtonP);
        TrendButtonP.addEventListener('click', () => {
            Sankey_LoadStyles();
            Sankey_Trends(1);
        });
        TrendButton = document.createElement('button');
        TrendButton.textContent = 'Trend Report';
        TrendButton.className = 'TrendButton ' + TrendButtonC;
        ShareButton.after(TrendButton);
        TrendButton.addEventListener('click', () => {
            Sankey_LoadStyles();
            Sankey_Trends(2);
        });
    } else {
        TrendButtonA = document.querySelector('div.ReportsChartCardControls__Root-sc-1w5c9v1-0');
        if(TrendButtonA != null) {
            TrendButtonA.style.display = "";
        }
    }
}

function Sankey_HideTrends() {
    TrendButtonA = document.querySelector('div.ReportsChartCardControls__Root-sc-1w5c9v1-0');
    if(TrendButtonA != null) {
        TrendButtonA.style.display = "none";
    }
}

function Sankey_ShowTrends() {

    ShareButton = document.querySelector('div.ReportsChartCardControls__ButtonGroup-sc-1w5c9v1-1');

    // Unhide or try again if failed
    if(ShareButton) {
        Sankey_UnhideTrends();
    } else { SaveLocationPathName = ""; }
}

function Sankey_LoadStyles() {

    let element=document.querySelector('div.Grid__GridItem-s9hcqo-1');
    if(element) {
        css_table0 = 'Trend_' + element.className;
    }
    element=document.querySelector('div.Card__CardRoot-sc-1pcxvk9-0');
    if(element) {
        css_table1 = 'Trend_' + element.className;
    }
    element=document.querySelector('div.CardHeader__Root-r0eoe3-0');
    if(element) {
        css_table2 = 'Trend_' + element.className;
    }
    element=document.querySelector('div.TransactionsSummaryCard__CardInner-sc-10q11ba-1');
    if(element) {
        css_grid = 'Trend_' + element.className;
    }
    element=document.querySelector('div.TransactionsSummaryCard__CardItem-sc-10q11ba-0');
    if(element) {
        css_items = 'Trend_' + element.className;
    }
    element=document.querySelector('div.CardHeader__Title-r0eoe3-1');
    if(element) {
        css_itemsB = 'Trend_' + element.className;
    }
    element=document.querySelector('span.TransactionsSummaryCard__ValueText-sc-10q11ba-7');
    if(element) {
        css_itemsD = 'Trend_' + element.className;
    }
}

function Init() {

    r_Init = true;

}

(function() {
    setInterval(() => {
        if(r_Init == false) {
            Init();
        }
        if(window.location.pathname != SaveLocationPathName) {
            TrendActive = false;
            if(SaveLocationPathName == '/reports/sankey') {
                Sankey_HideTrends();
            }

            SaveLocationPathName = window.location.pathname;

            if(SaveLocationPathName == '/reports/sankey') {
                Sankey_LoadStyles();
                Sankey_ShowTrends();
            }
        }
        if(TrendActive == true) {
            if(document.querySelector('div.SankeyDiagram__Root-y9ipuy-0') != null) {
                TrendActive = false;
                TrendQueue = [];
                Sankey_UnhideTrends();
                let elements2 = document.querySelector('span.CardTitle-sc-1yuvwox-0');
                if(elements2 != null) {
                    elements2.innerHTML = 'SANKEY DIAGRAM';
                }
            }
        }

    },750);
}());
