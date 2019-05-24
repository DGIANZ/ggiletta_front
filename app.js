//How Much Controller
var howMuchController = (function(){
  var Participant = function(id, name, payed){
    this.id = id;
    this.name = name;
    this.payed = payed;
    this.hasToGet = -1;
    this.hasToPay = -1;
  };

  var data = {
    participants: [],
    total : 0
  };

  var updateValues = function(){
    data.total = 0;
    var cant = data.participants.length;
    if (cant === 0) {
      cant = 1;
    }
    var amountPerPart;

    data.participants.forEach(function(p){
       data.total += p.payed;
    });

    amountPerPart = data.total / cant;

    data.participants.forEach(function(p){
       if (p.payed >= amountPerPart) {
         p.hasToGet = Math.round((p.payed - amountPerPart) * 10) / 10;
         p.hasToPay = 0;
       } else{
         p.hasToPay = Math.round((amountPerPart - p.payed) * 10) / 10;
         p.hasToGet = 0;
       }
    });

  };

  return {
    addParticipant: function(name, value){
      var newParticipant, id;
      //[1 2 3 4 5], next ID = 6
      //[1 2 4 6 8], next ID = 9
      // ID = last ID + 1

      //Create new ID
      if(data.participants.length > 0){
        id = data.participants[data.participants.length - 1].id + 1;
      }else{
        id= 0;
      }

      //Create new Participant
      newParticipant = new Participant(id, name, value);

      //Push it into the data structure
      data.participants.push(newParticipant);

      updateValues();

      return newParticipant;
    },

    removeParticipant: function(id){
      var ids, index;

            // id = 6
            //data.allItems[type][id];
            // ids = [1 2 4  8]
            //index = 3

            ids = data.participants.map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.participants.splice(index, 1);
            }

            updateValues();
    },

    getParticipants: function(){
        return data.participants;
    },

    testing: function(){
      console.log(data);
    }
  };


})();

//UI Controller
var UIController = (function(){

  var DOMstrings = {
    inputName: '.add__name',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    participantsContainer: '.participants__list'
  };

  var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands
            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    }; //No se está usando

  return{
    getInput: function(){
      return{
        name: document.querySelector(DOMstrings.inputName).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListParticipant: function(obj){
      var html, newHtml;

      html = '<tr id="%id%">  <td>%name%</td> <td>%value%</td> <td class="pay">%toPay%</td> <td class="income">%toRecieve%</td> <td><button type="submit" class="btn btn-primary my-2 mx-auto remove__btn">X</button></td> </tr>';

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%name%', obj.name);
      newHtml = newHtml.replace('%value%', obj.payed);
      newHtml = newHtml.replace('%toPay%', obj.hasToPay);
      newHtml = newHtml.replace('%toRecieve%', obj.hasToGet);

      document.querySelector(DOMstrings.participantsContainer).insertAdjacentHTML('beforeEnd', newHtml);
    },

    updateList: function(arr){
      var rows = '';
      var html, newHtml;

      console.log(arr);
      arr.forEach(function(p){
        html = '<tr id="%id%">  <td>%name%</td> <td>%value%</td> <td class="pay">%toPay%</td> <td class="income">%toRecieve%</td> </tr>';
        // For the delete button use <td><button type="submit" class="btn btn-primary my-2 mx-auto remove__btn">X</button></td>

        newHtml = html.replace('%id%', p.id);
        newHtml = newHtml.replace('%name%', p.name);
        newHtml = newHtml.replace('%value%', p.payed);
        newHtml = newHtml.replace('%toPay%', p.hasToPay);
        newHtml = newHtml.replace('%toRecieve%', p.hasToGet);

        rows += newHtml;
      });

      var list = document.querySelector(DOMstrings.participantsContainer);

      while (list.hasChildNodes()) {
        list.removeChild(list.firstChild);
      }

      document.querySelector(DOMstrings.participantsContainer).insertAdjacentHTML('beforeEnd', rows);


    },

    getDOMstrings: function(){
      return DOMstrings;
    },

    clearFields: function(){
      var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputName + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
    }
  };

})();

//Global App Controller
var controller = (function(hmCtrl, uiCtrl){

  var setupEventListeners = function(){
    var DOM = uiCtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

  };

  var ctrlAddItem = function(){
    var input, newParticipant;

    // 1. Get the field input Data
    input = uiCtrl.getInput();

    if (input.name !== "" && !isNaN(input.value) && input.value >= 0) {
            // 2. Add the item to the budget controller
            newParticipant = howMuchController.addParticipant(input.name, input.value);

            // 3. Add the item to the UI
          //  uiCtrl.addListParticipant(newParticipant);
            uiCtrl.updateList(hmCtrl.getParticipants());

            // 4. Clear the fields
            uiCtrl.clearFields();
        }
  };

  return {
    init: function() {
      console.log('Application has started.');
      //Setear otras cosas de la UI y setupEventListeners
      setupEventListeners();
    }
  };
})(howMuchController, UIController);

controller.init();
