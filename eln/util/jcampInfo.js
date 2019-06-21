import UI from 'src/util/ui';

import { convert } from '../libs/jcampconverter';

async function jcampInfo(value) {
  let jcamp = await DataObject.check(value.jcamp.data, true).get(true);

  let parsed = convert(String(jcamp), {
    withoutXY: true,
    keepRecordsRegExp: /.*/
  });

  let data = Object.keys(parsed.info).map((key) => {
    return { label: key, value: parsed.info[key] };
  });

  let html = `
        <style>
            #allParameters { 
                width: 100%;
            }
            #allParameters pre {
                margin: 0;
            }
            #allParameters td {
                vertical-align: top;
            }
            #allParameters tbody {
                display: block;
            }
            #allParameters tbody {
                height: 500px;
                overflow-y: auto;
            }
        </style>
        Search parameters: <input type='text' oninput='filter(this)'>
        <table id='allParameters'>
            <tbody>
                ${data
    .map(
      (datum) => `
                    <tr>
                        <td><b>${datum.label}</b></td>
                        <td><pre>${
  datum.value.replace
    ? datum.value.replace(/[\r\n]+$/, '')
    : datum.value
}</pre></td>
                    </tr>
                `
    )
    .join('\n')}
            </tbody>
        </table>
        <script>
            function filter(input) {
                let escaped=input.value.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
                let regexp=new RegExp(escaped,'i')
            console.log(regexp);
                let lines=document.getElementById('allParameters').getElementsByTagName('TR');
                for (let line of lines) {
                    let content=line.children[0].innerHTML;
                // console.log(regexp, content, content.match(regexp))
                    if (content.match(regexp) || content.match(/<th>/i)) {
                        line.style.display='';
                    } else {
                        line.style.display='none';
                    }
                }
            }
        </script>
    `;

  UI.dialog(html, {
    width: 800,
    height: 600,
    title: 'List of parameters'
  });
}

module.exports = jcampInfo;
