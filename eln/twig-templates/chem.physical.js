module.exports = `
<style>
    #physicalForm input[type=number] {
        width: 50px;
    }
    #physicalForm > table > tbody > tr > th {
        font-size:18px;
    }
</style>
<div id='physicalForm'>
    <h1>Physical</h1>
    
<table>
    <tr>
        <th>bp (°C)</th>
        <td>
            <table>
                <tr>
                    <th></th><th></th>
                    <th>Low</th>
                    <th>High</th>
                    <th>P (torr)</th>
                    <th>DOI</th>
                </tr>
                <tr data-repeat='bp'>
                    <td>
                        <input type='number' max=100000 data-field='low'>
                    </td>
                    <td>
                        <input type='number' data-field='high'>
                    </td>
                    <td>
                        <input type='number' data-field='pressure'>
                    </td>
                    <td>
                        <input type='text' size=20 data-field='doi'>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<table>
    <tr>
        <th>mp (°C)</th>
        <td>
            <table>
                <tr>
                    <th></th><th></th>
                    <th>Low</th>
                    <th>High</th>
                    <th>DOI</th>
                </tr>
                <tr data-repeat='mp'>
                    <td>
                        <input type='number' max=100000 data-field='low'>
                    </td>
                    <td>
                        <input type='number' data-field='high'>
                    </td>
                    <td>
                        <input type='text' size=20 data-field='doi'>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<table>
    <tr>
        <th>density</th>
        <td>
            <table>
                <tr>
                    <th></th><th></th>
                    <th>Low</th>
                    <th>High</th>
                    <th>Temp (°C)</th>
                    <th>DOI</th>
                </tr>
                <tr data-repeat='density'>
                    <td>
                        <input type='number' max=100000 data-field='low'>
                    </td>
                    <td>
                        <input type='number' data-field='high'>
                    </td>
                    <td>
                        <input type='number' data-field='temperature'>
                    </td>
                    <td>
                        <input type='text' size=20 data-field='doi'>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<table>
    <tr>
        <th>nd</th>
        <td>
            <table>
                <tr>
                    <th></th><th></th>
                    <th>Low</th>
                    <th>High</th>
                    <th>Temp (°C)</th>
                    <th>DOI</th>
                </tr>
                <tr data-repeat='nd'>
                    <td>
                        <input type='number' max=100000 data-field='low'>
                    </td>
                    <td>
                        <input type='number' data-field='high'>
                    </td>
                    <td>
                        <input type='number' data-field='temperature'>
                    </td>
                    <td>
                        <input type='text' size=20 data-field='doi'>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

</div>




<script>
    console.log('Parsing the template');
    require(['vh/util/twigAdvancedForm'], function(AF) {
        AF('physicalForm', {debug:true});
    });
</script>
`;
