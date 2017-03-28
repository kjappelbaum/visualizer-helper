/**
 * This code allows to create complex form in the twig module
 * You need in place modification
 * 
 * In the twig templat eyou will have something like:
 * 
 *  <script>
 *   require(['src/util/api'], function(API) {
 *       AdvancedForm('extendedForm', 'data', {debug:true});
 *   });
 *   </script>
 *   And the template will be like:
 *   
 *   <table>
 *       <tr>
 *           <th></th><th></th>
 *           <th>Kind</th>
 *           <th>Firstname</th>
 *           <th>Lastname</th>
 *           <th>Nationalities</th>
 *       </tr>
 *       <tr data-repeat='authors'>
 *           <td>
 *               <select data-field='kind'>
 *                   <option value=''></option>
 *                   <option value='author'>Author</option>
 *                   <option value='editor'>Editor</option>
 *              </select>
 *           </td>
 *           <td>
 *               <input type='text' size=10 data-field='firstname'>
 *           </td>
 *           <td>
 *               <input type='text' size=10 data-field='lastname'>
 *           </td>
 *           <td>
 *               <table>
 *                    <tr data-repeat='nationalities'>
 *                       <td>
 *                           <input placeholder="Nationality" type='text' size=10 data-field=''>
 *                       </td>
 *                   </tr>
 *               </table>
 *           </td>
 *       </tr>
 *   </table>
 */
 define(['src/util/api'], function (API) {
 
    function AdvancedForm(divID, variableName, options={}) {
        var data = API.getData(variableName);
        // we will initialise the form
        var dom=$(document.getElementById(divID));
        // Add the buttons ADD / REMOVE
        dom.find('[data-repeat]').prepend(`
            <td class='addRow'></td>
            <td class='removeRow'></td>
        `);

        // Add the style
        dom.parent().prepend(
            `<style>
                #${divID} .addRow:before {content: "+"; cursor: pointer;}
                #${divID} .removeRow:before {content: "-"; cursor: pointer;}
                #${divID} :focus {box-shadow: 0 0 2px 2px rgba(81, 203, 238, 1);}
                #${divID} td, #extendedForm th {vertical-align: top;}
            </style>`
        );

        // need to replicate rows
        var counter=0;
        do {
            var elements=dom.find('[data-repeat]:not([data-index])');
        console.log(elements.length);
        elements.each(function(index, row) {
            row=$(row);
            var jpath=getJpath(row);
            var variable=data.getChildSync(jpath);
            var table=row.closest('table');
            var length=0;
            var empty=false;
            if (!variable || variable.length===0 ) {
                length=1;
                empty=true;
            } else if (Array.isArray(variable)) {
                length=variable.length;
            } else {
                console.log('Wrong variable type', variable);
            }
            for (var i=0; i<length; i++) {
                if (i==0) {
                    var currentRow=row;
                } else {
                    var currentRow = row.clone();
                    table.append(currentRow);
                }
                currentRow.attr('data-index',i);
                renameRow(currentRow, jpath, i, empty);
            }
            rename(table);
        });
   } while (elements.length>0)
    
    // we force the incorporation of the data in the form
    data.triggerChange();
    
    // rename the attributes 'name' or 'name-empty' of one specific row based on the jpath
    function renameRow(row, jpath, rowIndex, empty) {
        row=$(row);
        row.children('td:not(:has(table))').find('[data-field]').each(function(index, element) {
            element=$(element);
            var name=jpath.join('.');
            name+='.'+rowIndex;
            var attr=element.attr('data-field');
            if (attr) name+='.'+attr;
            if (empty) {
                element.attr('name-empty', name);
            } else {
                element.attr('name', name);
            }
        })
    }


    // get the japth from one element based on the attributes 'data-repeat' and 'data-index'
    // the jpath is returned as an array
    function getJpath(element) {
        var jpath=[];
        while ($(element).length) {
            if ($(element).attr('data-index')) {
                jpath.unshift($(element).attr('data-index'));
            }
            jpath.unshift($(element).attr('data-repeat'));
            element=$(element).parent().closest('[data-repeat]');
        }
        return jpath;
    }

    /*
        Rename the the full table
    */
    function rename(tbody) {
        var base=getBase(tbody).base;
        var search=new RegExp(base+'.[0-9]+');
        var rows=tbody.children('tr:has(td)');
        rows.each(function(rowIndex, row) {
            var replace=base+'.'+rowIndex;
            for (var attr of ['name','name-empty']) {
                $(row).find('['+attr+']').each(
                    function(index, element) {
                        element=$(element);
                        var name=element.attr(attr);
                        name=name.replace(search,replace);
                        element.attr(attr, name);
                    }
                );
            }
        });
    }

    function getBase(element) {
        var names=[];
        element.find('[name]').each(function(index,element) {
            names.push($(element).attr('name'));
        });
        if (names.length===0) {
            return '';
        }
        names.sort();
        return {
            base: names[0].replace(/(.*)\.([0-9]+).*/,'$1'),
            index: names[0].replace(/(.*)\.([0-9]+).*/,'$2'),
        };
    }
    
    if (options.debug) {
        document.getElementById(divID).addEventListener('mouseover', function(event) {
            var target=$(event.target);
            if (target.attr('name')) {
                console.log('Name',target.attr('name'));
            }
        });
        document.getElementById(divID).addEventListener('mouseover', function(event) {
            var target=$(event.target);
            if (target.attr('name-empty')) {
                console.log('Empty',target.attr('name'));
            }
        });
    }
    
    
    // when the value of a row change we should rename property if it was hidden
    document.getElementById(divID).addEventListener('change', function(event) {
        var target=$(event.target);
        if (target.attr('name-empty')) {
            var empties=target.closest('tr').children('td:not(:has(table))').find('[name-empty]');
            empties.each( (index,element) => {
                $(element).attr('name',$(element).attr('name-empty'));
                $(element).removeAttr('name-empty');
            });
        }
    });
    
    document.getElementById(divID).addEventListener('click', function(event) {
        var from=event.target;
        var table=$(from).closest('tbody');
        var tr=$(from).closest('tr');
        switch (from.className) {
            case 'addRow':
                // if we try to add a row we should check if
                // there is already an empty one
                var empties=table.children('tr').children('td:not(:has(table))').find('[name-empty]');
                if (empties.length>0) {
                    empties[0].focus();
                    return;
                }
                var clone = tr.clone();
                clone.find(':text').val('');
                clone.find('tr:not(:first-child)').remove();
                var fields=clone.find('[name]');
                // rename attribute 'name' to 'name-empty'
                fields.each( (index,element) => {
                    $(element).attr('name-empty',$(element).attr('name'));
                    $(element).removeAttr('name');
                });
                table.append(clone);
                clone.find('[name-empty]')[0].focus();
                rename(table);
                break;
            case 'removeRow':
                var base=getBase(tr);
                if (base) {
                    var jpath=base.base.split('.');
                    var data = API.getData(variableName);
                    var variable=data.getChildSync(jpath)
                    variable.splice(base.index, 1);
                    data.triggerChange();
                    console.log(variable);
                    
                }
                console.log(base);
                // need to throw an event to remove this entry
                console.log(tr);
                if(table.children('tr:has(td)').length>1) {
                    tr.remove();
                } else {
                    tr.find(':text').val('');
                    tr.find('tr:not(:first-child)').remove();
                    var fields=tr.find('[name]');
                    fields.each( (index,element) => {
                        $(element).attr('name-empty',$(element).attr('name'));
                        $(element).removeAttr('name');
                    });
                    tr.find('[name-empty]')[0].focus();
                }
                rename(table);
                break;
            }
        })
    }
    return AdvancedForm;
 });