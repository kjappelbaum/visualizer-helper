export const style = `
<style>
    #extendedForm {
        padding: 10px;
    }
    #extendedForm .addRow {
        color: green;
        font-weight: bold;
        font-size: 12px;
        padding: .2em .4em;
    }
    #extendedForm .removeRow {
        color: red;
        font-weight: bold;
        font-size: 12px;
        padding: .2em .6em;
    }
    #extendedForm h1 {
        font-size: 16px;
        padding-top: 4px;
        padding-bottom: 4px;
    }
    #extendedForm h2 {
        font-size: 12px;
        margin-top: 12px;
        margin-bottom: 4px;
    }
    #extendedForm th {
        text-align: left;
        vertical-align: middle;
    }
    #extendedForm input[type=number]{
        width: 60px;
    }
    #extendedForm input, #extendedForm select {
        margin-top: 3px;
        margin-bottom: 3px;
    } 
</style>`;

export const dataNormalization = `
{% if keepOriginal %}
    <h1>Data normalization</h1>
    <table>
        <tr>
            <th align="left">Range:</th>
            <td>
                from: <input type="number" name="normalization.from" step="any"> - 
                to: <input type="number" name="normalization.to" step="any">
            </td>
        </tr>
        <tr>
            <th align="left">Nb points:</th>
            <td>
                <input type='number' name='normalization.numberOfPoints' size="6">
            </td>
        </tr>
        <tr>
            <th align="left">Filters</th>
            <td>
                <table>
                    <tr>
                        <th></th><th></th>
                        <th>Name</th>
                        <th>Options</th>
                    </tr>
                    <tr data-repeat='normalization.filters'>
                        <td>
                            <select data-field='name'>
                                <option value=""></option>
                                <option value="centerMean">Center Mean</option>
                                <option value="scaleSD">Divide by SD</option>
                                <option value="rescale">Rescale (0 to 1)</option>
                                <option value="normalize">Normalize (sum to 1)</option>
                            </select>
        
                        </td>
                        <td><input type='number' data-field='options' size="5"></td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <th align="left">Exclusions</th>
            <td>
                <table>
                    <tr>
                        <th></th><th></th>
                        <th>From</th>
                        <th>To</th>
                    </tr>
                    <tr data-repeat='normalization.exclusions'>
                        <td><input type='number' data-field='from' size="5"></td>
                        <td><input type='number' data-field='to' size="5"></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
{% endif %}
`;

export const spectraDisplay = `
<h1>Spectra display preferences</h1>

<table>
    <tr>
        <th>Spectra:</th>
        <td>
            <input type='radio' name='display.selection' value='all'>All
            <input type='radio' name='display.selection' value='selected'>Selected
            <input type='radio' name='display.selection' value='none'>None
        </td>
    </tr>
    {% if keepOriginal %}
        <tr>
            <th>Display:</th>
            <td>
                <input type='radio' name='display.original' value='true'> Original data
                <input type='radio' name='display.original' value='false'> Normalized data
            </td>
        </tr>
    {% else %}
        <input type='hidden' name='display.original' value='false'>
    {% endif %}
    <tr>
        <th>Box-plot shadow</th>
        <td>
            <input type="checkbox" name="display.boxplot" checked>
            <span onclick="toggle(this);">▶</span>
            <div style="display: none">
                <b>Box plot preferences:</b><br>
                Q2 stroke width: <input type="number" step="any" style="width:50px" name="display.boxplotOptions.q2StrokeWidth"> - color: <input type="color" name="display.boxplotOptions.q2StrokeColor"><br>
                Q1/Q3 fill opacity: <input type="number" step="any" style="width:50px" name="display.boxplotOptions.q13FillOpacity"> - color: <input type="color" name="display.boxplotOptions.q13FillColor"><br>
                min/max fill opacity: <input type="number" step="any" style="width:50px" name="display.boxplotOptions.minMaxFillOpacity"> - color: <input type="color" name="display.boxplotOptions.minMaxFillColor"><br>
            </div>  
        </td>
    </tr>
    <tr>
        <th>
            Display tracking info:
        </th>
        <td>
            <input type="checkbox" name="display.trackingInfo">
        </td>
    </tr>
    <tr>
        <th>
            Autocorrelation point index:
        </th>
        <td>
            <input type="number" name="display.autocorrelationIndex">
        </td>
    </tr>
</table>

<script>
    function toggle(element) {
        let nextStyle=element.nextElementSibling.style
        if (nextStyle.display==="none") {
            nextStyle.display = "block";
            element.innerHTML='▼';
        } else {
            nextStyle.display = "none";
            element.innerHTML='▶';
        }
    }
</script>
`;
