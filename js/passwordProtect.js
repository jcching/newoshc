//passwordProtect.js
//detects if the "activation key" has ever been entered
//if not, load the password prompt modal



if (localStorage.passcode!="clp>hec") {
	console.log("passcode wrong");

	if (localStorage.onsplash=="false") {

	console.log("onsplash is false");

	//onle load the password screen if the splash is not activated
		$( "body" ).load( "passwordProtect.html" );
	}
	
}


