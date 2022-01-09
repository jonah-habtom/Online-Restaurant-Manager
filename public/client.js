let restaurantToBeUpdated = {};    //Will hold the restaurant data that the user wishes to update

//Function that creates the header with links to the home, add restaurant, and restaurant list pages
function createHeader() {
	//Creates 3 link elements for the home, add restaurant, browse restaurants pages
	let home = document.createElement("a");
	let add = document.createElement("a");
	let browse = document.createElement("a");

	//Changes the inner HTML for each link so that the user can see what page they are being taken to
	home.innerHTML = "Home";
	add.innerHTML = "Add Restaurant";
	browse.innerHTML = "Browse Restaurants";

	//Assigns the proper links to each element
	home.href = "/";
	add.href = "/addrestaurant";
	browse.href = "/restaurants";

	//Gives each element the class name btn so it can be used for CSS styling
	home.className = "btn";
	add.className = "btn";
	browse.className = "btn";

	//Adds each link element to the header div
	document.getElementById("head").appendChild(home);
	document.getElementById("head").appendChild(add);
	document.getElementById("head").appendChild(browse);
}

//Function that initalizes the home page elements
function initHome() {
	//Calls the helper function to create the header at the top of the page
	createHeader();

	//Creates a welcome message to be displayed on the home page
	let message = document.createElement("h1");
	message.innerHTML = "Restaurant Management System";
	
	//Creates a message informing the user of the purpose of the browse restaurants button
	let browseMessage = document.createElement("p");
	browseMessage.innerHTML = "Click on the Browse Restaurants button to browse the restaurants in the system";
	browseMessage.className = "messages";

	//Creates a message informing the user on the purpose of the add restaurant button
	let addMessage = document.createElement("p");
	addMessage.innerHTML = "Click on the Add Restaurant button to add a restaurant to the system";
	addMessage.className = "messages";

	//Adds the 3 messages to the home page
	document.getElementById("welcome").appendChild(message);
	document.getElementById("welcome").appendChild(addMessage);
	document.getElementById("welcome").appendChild(browseMessage);
}

//Function that handles getting the data for a new restaurant to be added and sending a POST request to the server to validate the data
function sendNewRestaurant() {
	//Gets the name, delivery fee and minimum order inputted by the user for the new restaurant
	let restaurantName = document.getElementById("name").value;
	let deliveryFee = document.getElementById("fee").value;
	let minOrder = document.getElementById("min").value;

	//Creates a new restaurant object with the info obtained
	let newRestaurantData = {"name": restaurantName, "delivery_fee": parseFloat(deliveryFee), "min_order": parseFloat(minOrder)};
	
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState === 4 && xhttp.status === 201) {
			const obj = JSON.parse(xhttp.response);
			//Redirects the user to the new restaurant page if it is added succesfully
			window.location.href = "/restaurants/" + obj.id;
		} else if (xhttp.readyState === 4 && xhttp.status === 404) {
			//Alerts the user that the restaurant cannot be added if the data was not valid
			alert("Invalid Data. The restaurant could not be added.");
		}
	}
	//Sends the POST request to /restaurants with the data object for the new restaurant
	xhttp.open("POST", "/restaurants");
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(newRestaurantData));
}

//Function that initalizes all the elements of the add restaurant page
function initAddPage() {
	//Creates the header at the top of the page
    createHeader();

    let topPage = document.getElementById("top");

	//Creates a textbox where the user can type the name of the restaurant they wish to add
    let name = document.createElement("input");
    name.setAttribute("id", "name");
    topPage.appendChild(name);

    let nameLabel = document.createElement("label");
    nameLabel.innerHTML = "Restaurant Name: ";
    topPage.insertBefore(nameLabel, name);

	//Creates a textbox where the user can type the delivery fee for the restaurant
    let fee = document.createElement("input");
    fee.id = "fee";
    topPage.appendChild(fee);

    let feeLabel = document.createElement("label");
    feeLabel.innerHTML = "<br/>Delivery Fee: ";
    feeLabel.setAttribute("for", "fee");
    topPage.insertBefore(feeLabel, fee);

	//Crates a textbox where the user can type in the minimum order for the restaurant
    let min = document.createElement("input");
    min.id = "min";
    topPage.appendChild(min);

    let minLabel = document.createElement("label");
    minLabel.innerHTML = "<br/>Minimum Order: ";
    minLabel.setAttribute("for", "min");
    topPage.insertBefore(minLabel, min);

	//Creates a submit button with an event handler that sends the restaurant data to the server using the helper function when it is clicked
    let submit = document.createElement("input");
	submit.id = "submit";
    submit.type = "submit";
    submit.innerHTML = "Submit";
	submit.addEventListener("click", sendNewRestaurant);
    document.body.appendChild(submit);
}

//Function that initializes the page for a specific restaurant
function initRestaurantPage(restaurant) {
	createHeader();
	restaurantToBeUpdated = restaurant;  //Gets the object of the specific restaurant
	loadMenu();  //Calls helper function to display the menu and its categories
}

//Function that adds a new category to the dropdown menu and loads the menu with the new category
function addCategory() {
	//Gets the name of the category the user enters 
	let categoryName = document.getElementById("categoryName").value;
	let categorySelect = document.getElementById("categories");

	//If the user did not enter a category name, alert the user and do not add it to the restaurant
	if (categoryName == "") {
		alert("Please enter a name for the new category.");
		return;
	} else {
		//Loops through the categories in the menu to check if the category name already exists as we cannot have two categories with the same name
		for (let i = 0; i < categorySelect.length; i++) {
			//If the name already exists, alert the user and do not add the category to the restaurant
			if (categorySelect.options[i].innerHTML.toUpperCase() == categoryName.toUpperCase()) {
				alert("A category with that name already exists.");
				return;
			}
		}
	}
	//Adds the new category option to the dropdown menu
	let newOption = document.createElement("option");
	newOption.innerHTML = categoryName;
	categorySelect.appendChild(newOption);

	//Adds the new category to the menu of the restaurant
	restaurantToBeUpdated.menu[categoryName] = {};
	//Loads the menu with the new category in it
	loadMenu();
}

//Function that gets the name, description, and price of a new item tobe added, validates it, and adds it to the menu
function addMenuItem() {
	//Gets the name, description, and price of the item that the user wishes to add 
	let itemName = document.getElementById("itemName").value;
	let itemDesc = document.getElementById("itemDesc").value;
	let itemPrice = parseFloat(document.getElementById("itemPrice").value);
	let selector = document.getElementById("categories")

	//If there is no category in the menu, alert the user to add a category first and do not add the item to the menu
	if(selector.length == 0) {
		alert("You must create a category to add an item to.");
		return;
	}

	//Gets the category the user wishes to add the item to
	let category = selector.options[selector.selectedIndex].innerHTML;

	//If the user did not enter a name or description, alert them to fill out the textbox
	if(itemName == "" || itemDesc == "") {
		alert("Item not added. One or more data fields are not filled out.");
	//If the price is invalid, alert the user
	} else if (Number.isNaN(itemPrice) || itemPrice < 0 ) {
		alert("Item not added. Invalid price.");
	} else {
		//Gets a new unique id for the menu item using the helper function
		let id = getUniqueItemId();
		
		//Creates an object for the new item with all of its data and add the item to the menu for the restaurant
		let newItem = {name: itemName, description: itemDesc, price: itemPrice};
		restaurantToBeUpdated.menu[category][id] = newItem;

		//Loads the menu with the new menu item added
		loadMenu();
	}
}

//Helper function that gets the highest id out of all menu items and generates a new unique id for an item
function getUniqueItemId() {

	let highestId = 0; 
	let idArray = document.getElementsByClassName("itemId"); //Gets an array of all the menu item ids

	//If there are no menu items added to the menu yet, return 0 as the unique id for the first item to be added
	if (idArray.length == 0) {
		return highestId;
	}
	
	//Set the highest id to the first id in the array
	highestId = parseInt(idArray[0].innerHTML.split(": ")[1]);
	
	//Loops through the array of ids and checks if the current id is greater than the highest id
	for (let i=1; i < idArray.length; i++) {
		if (parseInt(idArray[i].innerHTML.split(": ")[1]) > highestId) {
			highestId = parseInt(idArray[i].innerHTML.split(": ")[1]);
		}
	}
	//Increases the highest id by 1 to get a unique id and returns it
	highestId++;
	return highestId;
}

//Function that handles sending the updated restaurant data to the server through a PUT request
function sendUpdatedData() {
	//Calls helper function to get any updates made to the restaurant name, minimum order, or delivery fee
	getUpdatedData();

	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState === 4 && xhttp.status === 200) {
			//Alerts the user that the updates were made and reloads the page if the response comes back successful
			alert("Changes were saved successfully.");
			location.reload();
		}
	}
	//Sends the PUT request with the updated restaurant object to /restaurants/"restId"
	xhttp.open("PUT", "/restaurants/" + restaurantToBeUpdated.id);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(restaurantToBeUpdated));
}

//Helper function that gets theu updates made to the restaurant name, minimum order, and delivery fee
function getUpdatedData() {
	//Gets the name, minimum order, and delivery fee values entered by the user
	let restaurantName = document.getElementById("name").value;
	let restaurantMinOrder = parseFloat(document.getElementById("min").value);
	let restaurantFee = parseFloat(document.getElementById("fee").value);

	//If the name of the restaurant is empty, alert the user to enter a valid anme
	if (restaurantName == "") {
		alert("Changes not saved. Must enter a restaurant name");
	//If the minimum order or delivery fee value is not valid, alert the user
	} else if (Number.isNaN(restaurantMinOrder) || Number.isNaN(restaurantFee) || restaurantMinOrder < 0 || restaurantFee < 0) {
		alert("Changes not saved. Invalid minimum order or delivery fee was entered");
	} else {
		//Updates the name, minimum order, and delivery fee keys of the restaurant object
		restaurantToBeUpdated.name = restaurantName;
		restaurantToBeUpdated.min_order = restaurantMinOrder;
		restaurantToBeUpdated.delivery_fee = restaurantFee;
	}
}

//Function that displays the menu for a restaurant with all the categories and items to the user
function loadMenu() {

	let menu = document.getElementById("menu");
	//Get the names of all categories in the restaurant
	let categories = Object.keys(restaurantToBeUpdated.menu);	
	
	//Clears the data already in the restaurant before updating it
	menu.innerHTML = "";

	//Loops through each category in the array of categories
	for (let category of categories) {
		//Creates a new div for the category so items can be added to that div	
		let categoryDiv = document.createElement("div");
		categoryDiv.id = category;

		//Creates an element to display the name of the menu item 
		let categoryName = document.createElement("p");
		categoryName.innerHTML = category;
		categoryName.className = "categoryHeader";
		categoryDiv.appendChild(categoryName);
		
		//Get an array of all the items in the restaurant menu
		let items = Object.keys(restaurantToBeUpdated.menu[category])
		
		//Loop through each id of items in the array
		for (let id of items) {
			let item = restaurantToBeUpdated.menu[category][id];
			let price = (restaurantToBeUpdated.menu[category][id].price).toFixed(2);

			//Displays the name and price of the item
			let nameAndPrice = document.createElement("p");
			nameAndPrice.innerHTML = "Name: " + item.name + " ($" + price + ")";
			nameAndPrice.className = "nameAndPriceHeader";

			//Displays the id of the item
			let itemId = document.createElement("p");
			itemId.innerHTML = "ID: " + id;
			itemId.className = "itemId";

			//Displays the description of the item
			let desc = document.createElement("p");
			desc.innerHTML = "Description: " + item.description + "</br></br>"; 
			desc.className = "descHeader";

			categoryDiv.append(nameAndPrice, itemId, desc);
		}
		//Add the category div to the menu so the user can see that category and its items
		menu.appendChild(categoryDiv);
	}
}
