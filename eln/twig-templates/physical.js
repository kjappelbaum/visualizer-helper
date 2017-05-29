module.exports = `
<div id='extendedForm'>
    <h1>My beer</h1>
    
    Title: <input type='text' name='title'>
    
    <table>
        <tr>    
            <th></th><th></th>
            <th>Kind</th>
            <th>Firstname</th>
            <th>Lastname</th>
            <th>Nationalities</th>
        </tr>
        <tr data-repeat='authors'>
            <td>
                <select data-field='kind'>
                    <option value=''></option>
                    <option value='author'>Author</option>
                    <option value='editor'>Editor</option>
                </select>
            </td>
            <td>
                <input type='text' size=10 data-field='firstname'>
            </td>
            <td>
                <input type='text' size=10 data-field='lastname'>
            </td>
            <td><input  data-field='image' type='file'></td>
            <td>
                <table>
                     <tr data-repeat='nationalities'>
                        <td>
                            <input placeholder=\"Nationality\" type='text' size=10 data-field=''>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    
    <h2>Keywords</h2>
    <table>
        <tr data-repeat='keywords'>
            <td>
                <input type='text' size=10 data-field=''>
            </td>
        </tr>
    </table>
    
    <h2>Parameters</h2>
    <table>
        <tr data-repeat='parameters'>
            <td>
                <input placeholder=\"Description\" type='text' size=10 data-field='description'>
            </td>
            <td>
                <input placeholder=\"Value\" type='text' size=10 data-field='value'>
            </td>
        </tr>
    </table>
</div>



<script>
    require(['vh/util/twigAdvancedForm'], function(AF) {
        AF('extendedForm', 'data', {debug:false});
    });
</script>"
`;