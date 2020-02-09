var step = 1;
var device = {};
var state = {"online": true};
var deviceReference = {};

function render(){

  var ajaxDeviceReference = new XMLHttpRequest();
  ajaxDeviceReference.addEventListener("load", loadDeviceReference);
  ajaxDeviceReference.open("GET", "/static/deviceReference.json");
  ajaxDeviceReference.send();

}

function loadRender(){
  document.getElementById('formulario').innerHTML = this.responseText;

  if (step == 1){
    Object.keys(deviceRefence['devices']).forEach(function(device){
      document.getElementById('type').innerHTML += '<option value="' + device + '">' + getDeviceCoolName(device) + '</option>'
    })
  } else if (step == 3){
    localDeviceTraits = deviceRefence['devices'][device['type']];
    localDeviceTraits.forEach(function(trait){
      document.getElementById('traits').innerHTML += '<option value="' + trait + '">' + getTraitCoolName(trait) + '</option>'
    })
  } else if(step == 4){
    device['traits'].forEach(function(trait){
      document.getElementById(trait).style.display = "block";
    });
  } else if(step == 5){
    document.getElementById("next").innerHTML = 'Finish';
    var askForData = 0;
    localDeviceTraits = deviceRefence['devices'][device['type']];
    //Loop over the device traits
    localDeviceTraits.forEach(function(trait){
      traitParams = deviceRefence['traits'][trait]['param']
      //Loop over the trait params
      Object.keys(traitParams).forEach(function(paramKey){
        if(traitParams[paramKey]['manual']){
          //Print data
          askForData += 1;
        } else {
          var type = traitParams[paramKey]['type'];
          if(type == 'string' || type == 'int' || type == 'bool'){
            state[paramKey] = traitParams[paramKey]['value'];
          } else if (type == 'object'){
            state[paramKey] = {}
            Object.keys(traitParams[paramKey]['content']).forEach(function(subParamKey){
              var subtype = traitParams[paramKey]['content'][subParamKey]['type'];
              if (subtype == 'int' || subtype == 'string' || subtype == 'bool'){
                state[paramKey][subParamKey] = traitParams[paramKey]['content'][subParamKey]['value'];
              }
            });
          }
        }
      });
    });
  } else if(step == 6){
    document.getElementById("next").style.visibility = 'hidden';
    window.location = '/devices/';
    setTimeout(function() {
      window.location = '/devices/';
    }, 2000);

  }
}

function loadDeviceReference(){
   deviceRefence = JSON.parse(this.responseText);

   var ajaxStep = new XMLHttpRequest();
   ajaxStep.addEventListener("load", loadRender);
   ajaxStep.open("GET", "/static/panel/assistant_device/" + step + ".html");
   ajaxStep.send();
}

next.addEventListener('click', e => {
  if(step == 1){
    device['id'] = document.getElementById('id').value;
    device['type'] = document.getElementById('type').value;
    names = document.getElementById('nick_names').value.split(';');
    device['name'] = {};
    device['name']['name'] = names[0];
    device['name']['defaultNames'] = names;
    device['name']['nicknames'] = names;
  } else if(step == 2){
    device['deviceInfo'] = {};
    device['deviceInfo']['hwVersion'] = document.getElementById('hwVersion').value;
    device['deviceInfo']['manufacturer'] = document.getElementById('manufacturer').value;
    device['deviceInfo']['model'] = document.getElementById('model').value;
    device['deviceInfo']['swVersion'] = document.getElementById('swVersion').value;
  } else if(step == 3){
    device['traits'] = [];
    var selectedTraits = document.getElementById("traits");
    for (var i = 0; i < selectedTraits.options.length; i++) {
       if(selectedTraits.options[i].selected == true){
            device.traits.push(selectedTraits.options[i].value);
        }
    }
  } else if (step == 4){
    device['attributes'] = {};
    //For each trait of the device
    device['traits'].forEach(function(trait){
      var traitAttributes = deviceRefence['traits'][trait]['attributes'];
      //Find all the attributes related with that trait
      Object.keys(traitAttributes).forEach(function(attribute){
        //Get the correct value depending on the vartype
        var value = 'none';
        if (traitAttributes[attribute]['type'] == "bool"){
          console.log(document.getElementById('customSwitch_' + attribute).checked);
          value = document.getElementById('customSwitch_' + attribute).checked;
        } else if (traitAttributes[attribute]['type'] == "string"){
          value = document.getElementById(attribute).value;
        } else if (traitAttributes[attribute]['type'] == "int"){
          value = parseInt(document.getElementById(attribute).value);
        } else if (traitAttributes[attribute]['type'] == "object"){
          //For each subattributes
          var subattributes = {};
          var countSubattributes = 0;
          Object.keys(traitAttributes[attribute]['content']).forEach(function(subattributeKey){
            if (traitAttributes[attribute]['content'][subattributeKey]['type'] == "bool"){
              subattributes[subattributeKey] = document.getElementById('customSwitch_' + subattributeKey).checked;
              countSubattributes+=1;
            } else if (traitAttributes[attribute]['content'][subattributeKey]['type'] == "string"){
              subattributes[subattributeKey] = document.getElementById(subattributeKey).value;
              countSubattributes+=1;
            } else if (traitAttributes[attribute]['content'][subattributeKey]['type'] == "int"){
              if(document.getElementById(subattributeKey).value != ''){
                subattributes[subattributeKey] = parseInt(document.getElementById(subattributeKey).value);
                countSubattributes+=1;
              }
            }
          });
          if(countSubattributes > 0){
            value = subattributes;
          }
        }
        //Store the value
        if(value != 'none'){
          device['attributes'][attribute] = value;
        }
      });
    });
  } else if(step == 5){
    save();
  }

  console.clear();
  console.log(device);

  step += 1;
  render();
});

function save(){
  data = {
    devices: device,
    status: state
  }

  //Send the data to the API
  var http = new XMLHttpRequest();
  http.addEventListener("load", function(){
    console.log(http.responseText);
  });
  http.open("GET", "/front/device/create/" + JSON.stringify(data));
  http.setRequestHeader('authorization', 'baerer ' + getCookieValue('token'))
  http.send();


  $('#alertContainer').html('<div class="alert alert-success fade show" role="alert" id="savedAlert"> <b>Success!</b> The device has been saved correctly.</div>');
  $('#savedAlert').alert()
  setTimeout(function() {
    $("#savedAlert").remove();
  }, 5000);



}

//////////////////
// Step1
//////////////////

function addName(id){
  names = document.getElementById(id).value.split(";");
  names.pop();
  var new_names = document.getElementById("add_" + id).value.split(";");
  console.log(names);
  var html = "";
  var string = "";
  names.forEach(function(name){
    html += '<button type="button" class="btn btn-primary" style="margin: 5px;" title="Click to delete" onclick="deleteName(\'' + id + '\',\'' + name + '\')">' + name + '</button>';
    string += name + ';';
  });
  new_names.forEach(function(name){
    html += '<button type="button" class="btn btn-primary" style="margin: 5px;" title="Click to delete" onclick="deleteName(\'' + id + '\',\'' + name + '\')">' + name + '</button>';
    string += name + ';';
  });
  document.getElementById("badge_" + id + "_container").innerHTML = html;
  document.getElementById(id).value = string;
  document.getElementById("add_" + id).value = "";
}

function deleteName(id, delete_name){
  names = document.getElementById(id).value.split(";");
  names.pop();
  console.log(names);
  var html = "";
  var string = "";
  names.forEach(function(name){
    if (name != delete_name){
      html += '<button type="button" class="btn btn-primary" style="margin: 5px;" title="Click to delete" onclick="deleteName(\'' + id + '\',\'' + name + '\')">' + name + '</button>';
      string += name + ';';
    }
  });
  document.getElementById("badge_" + id + "_container").innerHTML = html;
  document.getElementById(id).value = string;
  document.getElementById("add_" + id).value = "";
}
