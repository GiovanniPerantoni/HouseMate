usrInfo = "";
globalProductID = "";

// ======= SHARED FUNCTIONS =======

// Function used to get cookies by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Function used to retrive all users from api
async function retriveUserInfo(userID) {
    //$(async function() {
        await $.ajax({
            url: "http://127.0.0.1:3000/api/v1/apartment/users",
            type: "get",
            contentType: "application/json",
            headers: {'x-access-token' : userID},
            success: function(data, textStatus, jqXHR) {
                usrInfo = data;
                console.log("SUCCESS in retrive User Info");
            },
            failure: function(jqXHR, textStatus, errorThrown) {
                console.log("FAILURE in retrive user info");
                //return ["", "", ""];
            }
        });
    //});
}

// Function used to get user info from cookie
function getUser(userID) {
    for (let u=0; u<usrInfo.length; u++) {
        if (usrInfo[u].userID == userID) {
            return usrInfo[u];
        }
    }
    return "failure";
}

async function showInvitesButton() {
    await retriveUserInfo(getCookie("token"));
    let usr = getUser("token");
    if (usr.role == 'owner') {
        document.getElementById("sxNavbar").innerHTML += 
            '<li class="nav-item mx-2">' +
            '<a class="nav-link" href="invitesNew.html">Inviti</a>' +
            '</li>';
    }
}

// Function used to delete a cookie
function deleteCookie(name) {
    console.log("logout");
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// ======= SIGNUP =======

// Function used to check that the form has no errors
function validateForm() {
    const errElement = document.getElementById('errMsg');
    let name = document.getElementById("typeNameX").value;
    let surname = document.getElementById("typeSurnameX").value;
    let email = document.getElementById("typeEmailX").value;
    let pass1 = document.getElementById("typePasswordX").value;
    let pass2 = document.getElementById("typePassword2X").value;

    // If form not completely edited
    if (name == '' || surname == '' || email == '' || pass1 == '' || pass2 == '') {
        errElement.innerHTML = "Riempi tutti i campi del form.";
        return false;
    }

    // If email isn't valid
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        errElement.innerHTML = "Email non valida: inserisci una mail valida.";
        return false;
    }

    // If not same password return False else return True
    if (pass1 != pass2) {
        errElement.innerHTML = "Le password non corrispondono: inseriscile di nuovo...";
        return false;
    } else {
        errElement.innerHTML = "";
        text = '{"email":"'+email+'", "first_name":"'+name+'", "last_name":"'+surname+'", "pass":"'+pass1+'"}';
        return true;
    }
}

// Function used to send data to the backend and to create the token cookie
function sendData() {
    let res = validateForm();
    if (res) {
       $(function() {
           $.ajax({
               url: "http://127.0.0.1:3000/api/v1/signup",
               type: "POST",
               contentType: "application/json",
               data: text,
               success: function (data, textStatus, jqXHR) {
                   const d = new Date();
                   d.setTime(d.getTime() + (24*60*60*1000));
                   let expires = "expires="+d.toUTCString();
                   document.cookie = "token="+data.token+"; "+expires+"; path=/";
                   //console.log(document.cookie);
                   //console.log("SUCCESS!");
                   window.location = "/manageApartment.html";
               },
               error: function (jqXHR, textStatus, errorThrown) {
                   document.getElementById('errMsg').innerHTML = "La mail è già in uso.";
                   //console.log("FAILURE");
               }
           })
       });
    }
};

// ======= SIGNIN =======

// Function used to make the login
function signIn() {
    const errElement = document.getElementById('errMsg');
    let email = document.getElementById("typeEmailX").value;
    let password = document.getElementById("typePasswordX").value;

    if (email == '' || password == '') {
        errElement.innerHTML = "Riempire entrambi i campi";
        return false;
    }

    text = '{"email":"'+email+'", "pass":"'+password+'"}';
    
    $(function() {
           $.ajax({
               url: "http://127.0.0.1:3000/api/v1/login",
               type: "POST",
               contentType: "application/json",
               data: text,
               success: function (data, textStatus, jqXHR) {
                   //console.log(data.token);
                   const d = new Date();
                   d.setTime(d.getTime() + (24*60*60*1000));
                   let expires = "expires="+d.toUTCString();
                   document.cookie = "token="+data.token+"; "+expires+"; path=/";
                   //console.log(document.cookie);
                   //console.log("SUCCESS!");
                   window.location = "/viewExpenses.html"
               },
               error: function (jqXHR, textStatus, errorThrown) {
                   errElement.innerHTML = "Email o Password incorrette"
                   //console.log("FAILURE");
               }
           })
       });

}

// ======= EXPENSES =======

// Function used to insert a new expense on the html
function insertExpenseLine(productID, person, product, price, date, color) {
    document.getElementById("expensesList").innerHTML += 
    '<div>'+
    '<ul class="list-group list-group-horizontal rounded-0 bg-transparent">'+
    '<li class="list-group-item px-3 py-1 d-flex align-items-center flex-grow-1 border-0 bg-transparent">'+
    '<p class="lead fw-normal mb-0 text-white"><span style="color: '+color+'">'+person+'</span> ha comprato '+product+' (€ '+price+')</p>'+
    '</li>'+
    '<li class="list-group-item ps-3 pe-0 py-1 rounded-0 border-0 bg-transparent">'+
    '<div class="d-flex flex-row justify-content-end mb-1">'+
    '<button type="button" class="btn btn-outline-info mx-1 px-1" data-bs-toggle="modal" data-bs-target="#editExpense" onclick="globalProductID=\''+productID+'\'">'+
    '<i class="bi bi-pencil mx-2"></i>'+
    '</button>'+
    '</div>'+
    '<div class="text-end text-muted">'+
    '<a href="#!" class="text-muted" data-mdb-toggle="tooltip" title="Created date">'+
    '<p class="small mb-0"><i class="bi bi-info-circle-fill me-2"></i>'+date+'</p>'+
    '</a>'+
    '</div>'+
    '</li>'+
    '</ul>'+
    '</div>';
}

// Function used to show the expenses
function viewExpenses() {
    usrToken = getCookie("token");
    $(function() {
        $.ajax({
            url: "http://127.0.0.1:3000/api/v1/apartment/expenses/view",
            type: "get",
            contentType: "application/json",
            headers: {'x-access-token' : usrToken},
            success: function(data, textStatus, jqXHR) {
                console.log(usrInfo); 
                let contributiElem = document.getElementById('contribuenti');
                users = data.totals;
                for (let i in users) {
                    let infos = getUser(users[i].userID);
                    let str = '<h4 class="mb-4" style="color: '+infos.color+'">' + infos.first_name + ' ha contribuito con: ' + users[i].total + '</p>';
                    contributiElem.innerHTML += str
                }
                expenses = data.expenses;
                for (let i in expenses) {
                    let infos = getUser(expenses[i].userID);
                    insertExpenseLine(expenses[i].expenseID, infos.first_name, expenses[i].product, expenses[i].price, (expenses[i].date).slice(0,10), infos.color);
                }
                console.log("SUCCESS in viewExpenses");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("FAILURE in viewExpenses");
            }
        })
    });
}

// Wrapper function used for the setup of the page
async function setUpExpensePage() {
    await retriveUserInfo(getCookie("token"));
    viewExpenses();
}

// Function used to add an Expense
function addExpense() {
    let product = document.getElementById("typeProductX").value;
    let price = document.getElementById("typePriceX").value;
    const date = new Date();
    date.getUTCDate();
    let text = '{"price":'+price+', "product":"'+product+'", "date":"'+date+'"}';
    if (product != '' && price != '') {
        $(function() {
            $.ajax({
                url: "http://127.0.0.1:3000/api/v1/apartment/expenses/add",
                type: "post",
                contentType: "application/json",
                headers: {'x-access-token' : getCookie("token")},
                data: text,
                success: function (data, textStatus, jqXHR) {
                    console.log("SUCCESS in addExpenses");
                    window.location.reload();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("FAILURE in addExpenses");
                }
            })
        });
    }
}

// Function used to modify an expense
function modifyExpense() {
    let product = document.getElementById("modifyProductX").value;
    let price = document.getElementById("modifyPriceX").value;
    let date = document.getElementById("modifyDateX").value;
    
    let text = '{"expenseID":"'+globalProductID+'"';
    if (product != '') {
        text += ', "product":"'+product+'"';
    }
    if (price != '') {
        text += ', "price":'+price;
    }
    if (date != '') {
        text += ', "date":"'+date+'"';
    }
    text += '}';
    $(function() {
        $.ajax({
            url: "http://127.0.0.1:3000/api/v1/apartment/expenses/modify",
            type: "patch",
            contentType: "application/json",
            headers: {'x-access-token' : getCookie("token")},
            data: text,
            success: function(data, textStatus, jqXHR) {
                console.log("SUCESS in modifyExpense");
                window.location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("FAILURE in modifyExpense");
            }
        })
    });
}

// Function used to delete an expense
function deleteExpense() {
    let text = '{"expenseID":"'+globalProductID+'"}';
    $(function() {
        $.ajax({
            url: "http://127.0.0.1:3000/api/v1/apartment/expenses/delete",
            type: "delete",
            contentType: "application/json",
            headers: {'x-access-token' : getCookie("token")},
            data: text,
            success: function(data, textStatus, jqXHR) {
                console.log("SUCCESS in deleteExpense");
                window.location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("FAILURE in deleteExpense");
            }
        })
    })
}

// ======= LIST =======

// Function used to insert a new Product on the html
function insertListLine(productID, person, product, date, color) {
    document.getElementById("productList").innerHTML += 
    '<div>'+
    '<ul class="list-group list-group-horizontal rounded-0 bg-transparent">'+
    '<li class="list-group-item px-3 py-1 d-flex align-items-center flex-grow-1 border-0 bg-transparent">'+
    '<p class="lead fw-normal mb-0 text-white">'+product+'</p>'+
    '</li>'+
    '<li class="list-group-item ps-3 pe-0 py-1 rounded-0 border-0 bg-transparent">'+
    '<div class="d-flex flex-row justify-content-end mb-1">'+
    '<button type="button" class="btn btn-outline-info mx-1 px-1" data-bs-toggle="modal" data-bs-target="#editProduct" onclick="globalProductID=\''+productID+'\'">'+
    '<i class="bi bi-pencil mx-2"></i>'+
    '</button>'+
    '</div>'+
    '<div class="text-end text-muted">'+
    '<a href="#!" class="text-muted" data-mdb-toggle="tooltip" title="Last bought date">'+
    '<p class="small mb-0"><i class="bi bi-info-circle-fill me-2"></i><span style="color: '+color+'">'+person+'</span> il '+date+'</p>'+
    '</a>'+
    '</div>'+
    '</li>'+
    '</ul>'+
    '</div>';

}

function createUserList() {
    for (let u = 0; u < usrInfo.length; u++) {
        document.getElementById("modifyUserX").innerHTML += 
        '<option value="' + usrInfo[u].userID + '">' + usrInfo[u].first_name + ' ' + usrInfo[u].last_name + '</option>';
    }
}

// Function used to show the list
function viewList() {
    usrToken = getCookie("token");
    console.log(usrInfo)
    $(function() {
        $.ajax({
            url: "http://127.0.0.1:3000/api/v1/apartment/list/view",
            type: "get",
            contentType: "application/json",
            headers: {'x-access-token' : usrToken},
            success: function(data, textStatus, jqXHR) {
                products = data.products;
                console.log(products)
                for (let i in products) {
                    let infos = getUser(products[i].userID)
                    insertListLine(products[i].productID, infos.first_name, products[i].product, (products[i].date).slice(0,10), infos.color);
                }
                console.log("SUCCESS in viewProducts");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("FAILURE in viewProducts");
            }
        })
    });
}

// Wrapper function used for the setup of the page
async function setUpListPage() {
    await retrieveUserInfo(getCookie("token"));
    createUserList();
    viewList();
}

// Function used to add a Product to the list
function addProduct() {
    let product = document.getElementById("typeProductX").value;
    let date = document.getElementById("typeDateX").value;

    let text = '{"product":"'+product+'", "date":"'+date+'"}';

    if (product != '' && date !='') {
        $(function() {
            $.ajax({
                url: "http://127.0.0.1:3000/api/v1/apartment/list/add",
                type: "post",
                contentType: "application/json",
                headers: {'x-access-token' : getCookie("token")},
                data: text,
                success: function (data, textStatus, jqXHR) {
                    console.log("SUCCESS in addProducts");
                    window.location.reload();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("FAILURE in addProducts");
                }
            })
        });
    }
}

// Function used to modify a product
function modifyProduct() {
    let product = document.getElementById("modifyProductX").value;
    let date = document.getElementById("modifyDateX").value;
    let userID = document.getElementById("modifyUserX").value;

    let text = '{"productID":"'+globalProductID+'"';
    if (product != '') {
        text += ', "product":"'+product+'"';
    }
    if (date != '') {
        text += ', "date":"'+date+'"';
    }
    if (userID != '') {
        text += ', "userID":"'+userID+'"';
    }
    text += '}';

    $(function() {
        $.ajax({
            url: "http://127.0.0.1:3000/api/v1/apartment/list/modify",
            type: "patch",
            contentType: "application/json",
            headers: {'x-access-token' : getCookie("token")},
            data: text,
            success: function(data, textStatus, jqXHR) {
                console.log("SUCESS in modifyProduct");
                window.location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("FAILURE in modifyProduct");
            }
        })
    });

}

// Function used to delete a product
function deleteProduct() {
    let text = '{"productID":"'+globalProductID+'"}';
    $(function() {
        $.ajax({
            url: "http://127.0.0.1:3000/api/v1/apartment/list/delete",
            type: "delete",
            contentType: "application/json",
            headers: {'x-access-token' : getCookie("token")},
            data: text,
            success: function(data, textStatus, jqXHR) {
                console.log("SUCCESS in deleteProduct");
                window.location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("FAILURE in deleteProduct");
            }
        })
    })
}

// ======= VIEW =======

// Function used to show the apartment info
function viewApartment() {
    $(function() {
        $.ajax({
            url: "http://127.0.0.1:3000/api/v1/apartment/manage/info",
            type: "get",
            contentType: "application/json",
            headers: {'x-access-token' : getCookie("token")},
            success: function(data, textStatus, jqXHR) {
                document.getElementById("apartmentName").innerHTML = data.name;
                document.getElementById("apartmentAddress").innerHTML = data.address;
                document.getElementById("apartmentRules").innerHTML = data.rules;
                console.log("SUCCESS in viewApartment");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("FAILURE in viewExpenses");
            }
        })
    })
}

// ======= MANAGE =======

defaultName = "";       //valori di default se per caso la richiesta get dovesse fallire
defaultAddress = "";
defaultRules = "";

// Function used to retrive the current infos about the apartment
function manageApartment() {
    $(function() {
        $.ajax({
            url: "http://127.0.0.1:3000/api/v1/apartment/manage/info",
            type: "get",
            contentType: "application/json",
            headers: {'x-access-token' : getCookie("token")},
            success: function(data, textStatus, jqXHR) {
                defaultName = (typeof data.name !== 'undefined') ? data.name : defaultName;
                defaultAddress = (typeof data.address !== 'undefined') ? data.address : defaultAddress;
                defaultRules = (typeof data.rules !== 'undefined') ? data.rules : defaultRules;
                document.getElementById("typeApNameX").value = defaultName;
                document.getElementById("typeApAddressX").value = defaultAddress;
                document.getElementById("typeApRulesX").value = defaultRules;
                console.log("SUCCESS in manageApartment");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("FAILURE in manageApartment");
            }
        })
    })
}

// Function used to upload to the database the changes
function modifyApartment() {
    errElement = document.getElementById("errMsg");
    let name = document.getElementById("typeApNameX").value;
    let addr = document.getElementById("typeApAddressX").value;
    let rules = document.getElementById("typeApRulesX").value;
    let aptInfo = {};
    if (name != '' && name != defaultName) {
        aptInfo.name = name;
    }
    if (addr != '' && addr != defaultAddress) {
        aptInfo.address = addr;
    }
    if (rules != '' && rules != defaultRules) {
        aptInfo.rules = rules;
    }
    console.log(JSON.stringify(aptInfo));
    
    $(function() {
        $.ajax({
            url: "http://127.0.0.1:3000/api/v1/apartment/manage/info",
            type: "patch",
            contentType: "application/json",
            headers: {'x-access-token' : getCookie("token")},
            data: JSON.stringify(aptInfo),
            success: function(data, textStatus, jqXHR) {
                console.log("SUCCESS in modifyApartment");
                //window.location = "viewApartment.html";       //TODO fare il redirect solo quando si crea un appartamento
                window.location = "/invitesNew.html";
            },
            failure: function(jqXHR, textStatus, errorThrown) {
                console.log("FAILURE in modifyApartment");
            }
        })
    })

    return true;
}

// ======= INVITES NEW =======

function sendInviteRequest() {
    const listaEmailsEl = document.getElementById("emailsUsersX");
    const invitoGeneratoEl = document.getElementById("typeInviteLinkX");
    const errEl = document.getElementById("errMsg");
    if (listaEmailsEl.value == "") {
        errEl.innerHTML = "Inserire almeno 1 email"
        return;
    }

    listaEmails = listaEmailsEl.value.split('\n')

    $(function () {
        $.ajax({
            url: "http://127.0.0.1:3000/api/v1/apartment/invites/new",
            type: "patch",
            contentType: "application/json",
            headers: { 'x-access-token': getCookie("token") },
            data: '{"users":' + JSON.stringify(listaEmails) + '}',
            success: function (data, textStatus, jqXHR) {
                invitoGeneratoEl.value = data.invite;
                errEl.innerHTML = "";
                console.log("SUCCESS in invites");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errEl.innerHTML = jqXHR.responseJSON.motivation;
                console.log("FAILURE in invits");
            }
        })
    })
}

// ======= INVITES CONFIRM =======

function sendInviteRequest() {
    const inviteCodeEl = document.getElementById("inviteCodeX");
    const errEl = document.getElementById("errMsg");

    console.log(inviteCodeEl.value)
    if (inviteCodeEl.value == "") {
        errEl.innerHTML = "Inserire il codice di invito"
        return;
    }

    $(function () {
        $.ajax({
            url: "http://127.0.0.1:3000/api/v1/apartment/invites/accept",
            type: "post",
            contentType: "application/json",
            headers: { 'x-access-token': getCookie("token") },
            data: '{"invite":\"' + inviteCodeEl.value + '\"}',
            success: function (data, textStatus, jqXHR) {
                errEl.className = "mt-4 text-success"
                errEl.value = "Invito valido, stai per essere renderizzato nella pagina dell'appartamento";
                console.log("SUCCESS in invites");

                setTimeout(() => {
                    //window.location = "/viewExpenses.html"
                }, 2000);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errEl.innerHTML = jqXHR.responseJSON.motivation;
                console.log("FAILURE in invits");
            }
        })
    })
}
