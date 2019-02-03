var budgetController = (function(){
    //function constructor - data structure for budget controller
    /* we need a data model for expences and income to save. Each item will have a description and value and hence 
    we need a unique id to access different values when required to take actions. Object is best choice to store all these data.
    when we need lot of objects to create, then we need a function constructors which we can then use to instantiate lots of objects(expense/income).*/
    
    // Expense function constructor to make use of creating multiple expenses. In case if we need some methods for expense, use prototype.
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // create a prototype methods to calculate percentages as it needs for every expense
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0){
            this.percentage = Math.round((this.value /totalIncome) * 100);
        } else {
            this.percentage = -1;
        } 
    }

    //get percentage from object
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    // Income function constructor to make use of creating multiple incomes. In case if we need some methods for income, use prototype.
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    //calculate total income and keep it private
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    //data structure which is ready to receive and store data
    var data = {
        allItems : {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    //add item to data store
    var addItem = function(type, desc, val) {
        var newItem, ID;
        //create new ID
        var getItem = data.allItems[type];
        ID = getItem.length === 1 ? getItem[getItem.length-1].id+1 : 0;
        //create new item based on inc or exp
        if (type === 'exp') {
            newItem = new Expense(ID, desc, val);
        } else if(type === 'inc') {
            newItem = new Income(ID, desc, val);
        }
        //push into to out data structure
        data.allItems[type].push(newItem);
        // other function going to call this one will have direct access to the one it got created.
        return newItem;
    };
    
    //delete item from data structure
    var deleteItem = function(type, id) {
        var index, ids;
        ids = data.allItems[type].map(function(current){
            return current.id;
        });
        index = ids.indexOf(id);
        if (index !== -1) {
            data.allItems[type].splice(index, 1);
        }
    }

    //calculate percentages
    var calculatePercentage = function() {
        data.allItems.exp.forEach(function(cur){
            cur.calcPercentage(data.totals.inc);
        })
    }

    var getPercentages = function() {
        var allPerc = data.allItems.exp.map(function(cur){
            return cur.getPercentage();
        });
        return allPerc;
    }

    //calculate budget
    var calculateBudget = function() {
        //calculate total income and expences
        calculateTotal('exp');
        calculateTotal('inc');
        //calc the budget: income-expenses
        data.budget = data.totals.inc - data.totals.exp;
        //calculate the percentage of income that we spent
        if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
            data.percentage = -1;
        }
        
    };
    //get budget
    var getBudget = function() {
        return {
            budget: data.budget,
            totalInc : data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage,
        };
    }

    return {
        addItem: addItem,
        calculateBudget: calculateBudget,
        getBudget: getBudget,
        deleteItem: deleteItem,
        calculatePercentage: calculatePercentage,
        getPercentages: getPercentages
    }

})();

var uiController = (function() {
    // DOM selectors object 
    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputVal: '.add__value',
        button: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel:'.budget__title--month'
    }
    // fetch all input values
    var getInput = function() {
        var type, description, value;
        return {
            type : document.querySelector(DOMstrings.inputType).value, // will be wither income or expense
            description : document.querySelector(DOMstrings.inputDesc).value,
            value : parseFloat(document.querySelector(DOMstrings.inputVal).value)
        }
    }
    // add items to list
    var addListItem = function(obj, type) {
        var html, newHtml, element;
        //create HTML string with placeholder text
        if(type === 'inc') {
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
        else if (type === 'exp'){
            element = DOMstrings.expenseContainer;
            html = `<div class="item clearfix" id="exp-%id%">
            <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                        <div class="item__percentage">21%</div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>
                    </div>`
        }
            
        //replace placeholder text with actual data
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', obj.value);
        //insert html into DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    }
    
    //delete item from UI
    var deleteListItem = function(selectorID) {
        var el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);
    
    }

    //clear all fields
    var clearFields= function() {
        var fields, fieldsArr;
        //querySelectorAll will get it like a list
        fields = document.querySelectorAll(DOMstrings.inputDesc + ',' + DOMstrings.inputVal);
        //inorder to convert list to array, use call and pass fields to it
        fieldsArr = Array.prototype.slice.call(fields);
        //clear all fields and make empty
        fieldsArr.forEach((current, index, array) => {
            current.value = "";
        });
        fieldsArr[0].focus();
    };

    var displayBudget = function(obj) {
        document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
        document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
        document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

        if (obj.percentage > 0) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
        } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = '--';
        }
    }

    //display percentages on <li> expenses items
    var displayPercentages = function(percentages) {
        var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
        
        var nodeListForEach = function(list, callback) {
            for(var i=0; i<list.length; i++) {
                callback(list[i],i);
            }
        };

        nodeListForEach(fields, function(current, index) {
            if(percentages[index] > 0) {
                current.textContent = percentages[index] + '%';
            } else {
                current.textContent = '--'
            }
        });
    }

    var displayDate = function() {
        var now, months, month, year;
        now = new Date();
        year = now.getFullYear();
        months = ['Jan','Feb','Mar','Apr','May',"Jun",'Jul','Aug','Sep','Oct','Nov','Dec'];
        month = now.getMonth();
        document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+ year;
    }

    // make it available for public to access functions and objects
    return {
        getInput : getInput,
        DOMstrings: DOMstrings,
        addListItem: addListItem,
        clearFields: clearFields,
        displayBudget: displayBudget,
        deleteListItem: deleteListItem,
        displayPercentages: displayPercentages,
        displayDate: displayDate
    }
})();

//Global App Controller
var controller = (function(budgetCtrl, UICtrl) {
    //bind events to DOM
    var bindEvents = function() {
        var DOM = UICtrl.DOMstrings;
        document.querySelector(DOM.button).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e) {
            if(e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }
    var updateBudget = function() {
        //calculate the budget
        budgetCtrl.calculateBudget();
        //return the budget
        var budget = budgetCtrl.getBudget();
        //display the budget
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {
        //calculate the percentages
        budgetCtrl.calculatePercentage();
        //read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        //update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function() {
        var input, newItem;
        // get the input fields data
        input = UICtrl.getInput();
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
        // add the item to budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // add the list item to UI
        UICtrl.addListItem(newItem, input.type);
        //clear the fields
        UICtrl.clearFields();
        //update budget
        updateBudget();
        //calculate and update percentages
        updatePercentages();
        }
        
    }

    var ctrlDeleteItem = function(e) {
        var itemID, splitID, type, ID;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // delete the item from data structure
            budgetCtrl.deleteItem(type, ID)
            //delete item from UI
            UICtrl.deleteListItem(itemID)
            //update and show the new budget
            updateBudget();
            //calculate and update percentages
            updatePercentages();
        }
    }
    //initialize the application
    var init = function() {
        bindEvents();
        console.log('Application has Started');
        UICtrl.displayDate();
        UICtrl.displayBudget({
            budget: 0,
            totalInc : 0,
            totalExp: 0,
            percentage: 0
        })
    }
    //to make it available for public
    return {
        init: init,
    }
    
})(budgetController, uiController);
//call init function
controller.init();