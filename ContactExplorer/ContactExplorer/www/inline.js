//Sample code for Hybrid REST Explorer




// The version of the REST API you wish to use in your app.
var apiVersion = "v28.0";

// If you want to prevent dragging, uncomment this section
/*
 function preventBehavior(e)
 {
 e.preventDefault();
 };
 document.addEventListener("touchmove", preventBehavior, false);
 */

/* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
 see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
 for more details -jm */
/*
 function handleOpenURL(url)
 {
 // do something with the url passed in.
 }
 */

var forcetkClient;
var debugMode = true;
var logToConsole = cordova.require("salesforce/util/logger").logToConsole;

jQuery(document).ready(function() {
                       //Add event listeners and so forth here
                       logToConsole("onLoad: jquery ready");
                       document.addEventListener("deviceready", onDeviceReady,false);
                       
                       });

// When this function is called, Cordova has been initialized and is ready to roll
function onDeviceReady() {
//    alert('Inline');
    logToConsole("onDeviceReady: Cordova ready");
    //Call getAuthCredentials to get the initial session credentials
    cordova.require("salesforce/plugin/oauth").getAuthCredentials(salesforceSessionRefreshed, getAuthCredentialsError);
    
    //register to receive notifications when autoRefreshOnForeground refreshes the sfdc session
    document.addEventListener("salesforceSessionRefresh",salesforceSessionRefreshed,false);
    //getAccounts();
    //enable buttons
    regLinkClickHandlers();
    
}


function salesforceSessionRefreshed(creds) {
    logToConsole("salesforceSessionRefreshed");
    
    // Depending on how we come into this method, `creds` may be callback data from the auth
    // plugin, or an event fired from the plugin.  The data is different between the two.
    var credsData = creds;
    if (creds.data)  // Event sets the `data` object with the auth data.
        credsData = creds.data;
    
    forcetkClient = new forcetk.Client(credsData.clientId, credsData.loginUrl, null,
                                       cordova.require("salesforce/plugin/oauth").forcetkRefresh);
    forcetkClient.setSessionToken(credsData.accessToken, apiVersion, credsData.instanceUrl);
    forcetkClient.setRefreshToken(credsData.refreshToken);
    forcetkClient.setUserAgentString(credsData.userAgent);
}

function getAuthCredentialsError(error) {
    logToConsole("getAuthCredentialsError: " + error);
}


function getAccounts()
    {
    }


function regLinkClickHandlers() {
    var $j = jQuery.noConflict();
    var logToConsole = cordova.require("salesforce/util/logger").logToConsole;
    getAccounts();
    
    //logToConsole("link_fetch_sfdc_accounts clicked");
    //forcetkClient.query("SELECT Name FROM Account", onSuccessSfdcAccounts, onErrorSfdc);
    //path, method, payload, headerParams, callback, error
    //forcetkClient.apexrest("/GetJobSitesSvc", "GET",null,null,accntSuccessCallback,errorCallback);
    
    $j('#link_fetch_device_contacts').click(function() {
                                            logToConsole("link_fetch_device_contacts clicked");
                                            var contactOptionsType = cordova.require("cordova/plugin/ContactFindOptions");
                                            var options = new contactOptionsType();
                                            options.filter = ""; // empty search string returns all contacts
                                            options.multiple = true;
                                            var fields = ["name"];
                                            var contactsObj = cordova.require("cordova/plugin/contacts");
                                            contactsObj.find(fields, onSuccessDevice, onErrorDevice, options);
                                            });
    
    $j('#link_fetch_sfdc_contacts').click(function() {
                                          logToConsole("link_fetch_sfdc_contacts clicked");
                                          $j("#tableJobSites-tbody").empty();
                                          forcetkClient.apexrest("/GetContactsSvc", "GET",null,null,accntSuccessCallback,errorCallback);
                                          });
    
    $j('#link_fetch_sfdc_accounts').click(function() {
                                          logToConsole("link_fetch_sfdc_accounts clicked == ");
                                          $j("#tableJobSites-tbody").empty();
                                           forcetkClient.apexrest("/GetAccountsSvc", "GET",null,null,accntSuccessCallback,errorCallback);
                                          });
    $j('#link_fetch_sfdc_JobSites').click(function() {
                                          logToConsole("link_fetch_sfdc_JobSites clicked == ");
                                          $j("#tableJobSites-tbody").empty();
                                          forcetkClient.apexrest("/GetJobSitesSvc", "GET",null,null,accntSuccessCallback,errorCallback);
                                          });
    $j('#link_fetch_sfdc_Trades').click(function() {
                                          logToConsole("link_fetch_sfdc_Trades clicked == ");
                                          $j("#tableJobSites-tbody").empty();
                                          forcetkClient.apexrest("/GetTradesSvc", "GET",null,null,accntSuccessCallback,errorCallback);
                                          });
   
    function accntSuccessCallback(data){

        for(var i=0;i<data.length;i++){
            logToConsole('Accounts: ' +data[i].Name);
        }
        

        logToConsole('data ;;;' + data);
        for (var key in data)
        {
            if (data.hasOwnProperty(key))
            {
                logToConsole(data[key].Name);
                var linkTd=jQuery('<td></td>');
                logToConsole(linkTd);
                var jobsitelink = jQuery('<a href = /'+data[key].Id+'>'+data[key].Name+'</a>');
                linkTd.append(jobsitelink);
                var tabTr=jQuery('<tr></tr>');
                tabTr.append(linkTd);
                tabTr.append('<td>'+data[key].Zone__c+'</td>');
                tabTr.append('<td>'+data[key].Active_Rents__c+'</td>');
                tabTr.append('<td>'+data[key].Trades__c+'</td>');
                tabTr.append('<td>'+data[key].Stage__c+'</td>');
                // here you have access to
                jQuery('#tableJobSites > tbody:last').append(tabTr);
            }
        }

        
    }
    
    function errorCallback(){
        logToConsole('errror callled');
    }
    
    
    $j('#link_reset').click(function() {
                            logToConsole("link_reset clicked");
                            $j("#div_device_contact_list").html("")
                            $j("#div_sfdc_contact_list").html("")
                            $j("#div_sfdc_account_list").html("")
                            $j("#console").html("")
                            });
    
    $j('#link_logout').click(function() {
                             logToConsole("link_logout clicked");
                             var sfOAuthPlugin = cordova.require("salesforce/plugin/oauth");
                             sfOAuthPlugin.logout();
                             });
}

function onSuccessDevice(contacts) {
    var $j = jQuery.noConflict();
    cordova.require("salesforce/util/logger").logToConsole("onSuccessDevice: received " + contacts.length + " contacts");
    $j("#div_device_contact_list").html("")
    var ul = $j('<ul data-role="listview" data-inset="true" data-theme="a" data-dividertheme="a"></ul>');
    $j("#div_device_contact_list").append(ul);
    
    ul.append($j('<li data-role="list-divider">Device Contacts: ' + contacts.length + '</li>'));
    $j.each(contacts, function(i, contact) {
            var formattedName = contact.name.formatted;
            if (formattedName) {
            var newLi = $j("<li><a href='#'>" + (i+1) + " - " + formattedName + "</a></li>");
            ul.append(newLi);
            }
            });
    
    $j("#div_device_contact_list").trigger( "create" )
}

function onErrorDevice(error) {
    cordova.require("salesforce/util/logger").logToConsole("onErrorDevice: " + JSON.stringify(error) );
    alert('Error getting device contacts!');
}

function onSuccessSfdcContacts(response) {
    var $j = jQuery.noConflict();
    cordova.require("salesforce/util/logger").logToConsole("onSuccessSfdcContacts: received " + response.totalSize + " contacts");
    
    $j("#div_sfdc_contact_list").html("")
    var ul = $j('<ul data-role="listview" data-inset="true" data-theme="a" data-dividertheme="a"></ul>');
    $j("#div_sfdc_contact_list").append(ul);
    
    ul.append($j('<li data-role="list-divider">Salesforce Contacts: ' + response.totalSize + '</li>'));
    $j.each(response.records, function(i, contact) {
            var newLi = $j("<li><a href='#'>" + (i+1) + " - " + contact.Name + "</a></li>");
            ul.append(newLi);
            });
    
    $j("#div_sfdc_contact_list").trigger( "create" )
}

function onSuccessSfdcAccounts(response) {
    var $j = jQuery.noConflict();
    cordova.require("salesforce/util/logger").logToConsole("onSuccessSfdcAccounts: received " + response.totalSize + " accounts");
    
    $j("#div_sfdc_account_list").html("")
    var ul = $j('<ul data-role="listview" data-inset="true" data-theme="a" data-dividertheme="a"></ul>');
    $j("#div_sfdc_account_list").append(ul);
    
    ul.append($j('<li data-role="list-divider">Salesforce Accounts: ' + response.totalSize + '</li>'));
    $j.each(response.records, function(i, record) {
            var newLi = $j("<li><a href='#'>" + (i+1) + " - " + record.Name + "</a></li>");
            ul.append(newLi);
            });
    
    $j("#div_sfdc_account_list").trigger( "create" )
}

function onErrorSfdc(error) {
    cordova.require("salesforce/util/logger").logToConsole("onErrorSfdc: " + JSON.stringify(error));
    alert('Error getting sfdc contacts!');
}