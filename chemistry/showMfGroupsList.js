/*
We retrieve some exercises for structural analysis
 */

import UI from 'src/util/ui';

import MolecularFormula from '../eln/libs/MolecularFormula';

const MF = MolecularFormula.MF;
const groups = JSON.parse(JSON.stringify(MolecularFormula.Groups));

groups.forEach((group) => {
  group.mfHtml = new MF(String(group.mf)).toHtml();
});
let html = `
    <style>
        #allGroups {
            width: 100%;
        }
        #allGroups thead, #allGroups tbody {
            display: block;
        }
        #allGroups tbody {
            height: 300px;
            overflow-y: auto;
        }
        #allGroups thead th:nth-child(1), #allGroups tbody td:nth-child(1) {
            width: 70px;
        }
        #allGroups thead th:nth-child(2), #allGroups tbody td:nth-child(2) {
            width: 250px;
            text-overflow:ellipsis;
        }
        #allGroups thead th:nth-child(3), #allGroups tbody td:nth-child(3) {
            width: 50px;
            text-overflow:ellipsis;
        }
    </style>
    Filter the list: <input type='text' oninput='filter(this)'>
    <table id='allGroups'>
        <thead>
            <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>mf</th>
            </tr>
        </thead>
        <tbody>
            ${groups.map((group) => `
                <tr>
                    <td>${group.symbol}</td>
                    <td>${group.name}</td>
                    <td>${group.mfHtml}<span style='display:none'>${group.mf}</span></td>
                </tr>
            `
  ).join('\n')}
        </tbody>
    </table>
    <script>
        function filter(input) {
            let regexp=new RegExp(input.value,'i')
            let lines=document.getElementById('allGroups').getElementsByTagName('TR');
            for (let line of lines) {
                let content=line.innerHTML;
                console.log(regexp); 
                if (content.match(regexp) || content.match(/<tr>/i)) {
                    line.style.display='';
                } else {
                    line.style.display='none';
                }
            }
        }
    </script>
`;

module.exports = function showMfGroupsList() {
  UI.dialog(html, {
    width: 500,
    height: 400,
    title: 'List of known groups'
  });
};
