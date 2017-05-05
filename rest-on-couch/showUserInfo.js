'use strict';

define(['src/util/ui'], function(UI) {

    function showUserInfo(user) {
        let html='';
        html+=`<style>
            #userInfo {font-size:2em};
            #userInfo h1 {font-size: 30px};
            #userInfo th {text-align: left};
        </style>`;
        html+='<div id="userInfo">';
        html+='<h1>'+user.email+'</h1>';
        html+=`
        <table>
            <tr>
                <th>User ID</th>
                <td>${user.userId}</td>
            </tr>
            <tr>
                <th>Firstname</th>
                <td>${user.firstName}</td>
            </tr>
            <tr>
                <th>Lastname</th>
                <td>${user.lastName}</td>
            </tr>
            <tr>
                <th>Group</th>
                <td>${user.groupName}</td>
            </tr>
            <tr>
                <th>Phone number</th>
                <td>${user.phoneNumber}</td>
            </tr>
            <tr>
                <th>Room number</th>
                <td>${user.roomNumber}</td>
            </tr>
            <tr>
                <th>Room number</th>
                <td>${user.postalAddress}</td>
            </tr>
             <tr>
                <th>Groups</th>
                <td>${user.allGroups.join('<br>')}</td>
            </tr>
        
        </table>`;
        html+='</div>';


        UI.dialog(html, {
            width:800,
            height:400,
            title:'Logged in user information'
        });
    }

    return showUserInfo;

});









