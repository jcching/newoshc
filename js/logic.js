
	//pick a random question to start with
	var questionNum = Math.floor(Math.random()*bank.length);
	//set down the flag for next question
	var answered = false;
	//save the correct answer for drawAnswer
	var correctAnswer = 0;

	var pastquestions;//array to store past questions (unused)
	
	var remainingQuestionArray;
	//store compliant numbers here, random order
	//when drawn, numbers are removed from the list until
	//none remain.
	//update whenever settings are changed

	
	//stat counters 
	var totalQuestionCount=0;
	var correctQuestionCount=0;
	var percentCorrect=0;
	var streakCounter=0;

	var serverStatString;

	//settings flags
	var officeOnly = false;
	var qUpperRange = 20;
	var qLowerRange = 1;
	var staffId;

$(function() {


	FastClick.attach(document.body);

    loadSettings();
    serverGetStreak();
    resumeExitState();



	//click handlers
	$( "#ansA" ).click(function() {
	  	if(answered){
			drawNextQuestion();
		}else{
			drawAnswer(0);
		}
	});
	$( "#ansB" ).click(function() {	  	
		if(answered){
			drawNextQuestion();
		}else{
			drawAnswer(1);
		}
	});
	$( "#ansC" ).click(function() {
	  	if(answered){
			drawNextQuestion();
		}else{
			drawAnswer(2);
		}
	});

	//keyboard handler
	$(document).keypress(function(event) {
	    var keycode = (event.keyCode ? event.keyCode : event.which);
	    if(keycode == '49') {
	        if(answered){
				drawNextQuestion();
			}else{
				drawAnswer(0);
			}
	    }if(keycode == '50') {
	        if(answered){
				drawNextQuestion();
			}else{
				drawAnswer(1);
			}   
	    }if(keycode == '51') {
	        if(answered){
				drawNextQuestion();
			}else{
				drawAnswer(2);
			}   
	    }
	});

	$("#numberSearchButton").click(function(){
		var searchNumber = $("#numberSearchBox").val();
		searchAndDisplay(searchNumber);
		$('#searchModal').modal('toggle');
		$('.navbar-collapse').collapse('hide'); 
	});

	$("#saveSettingsBtn").click(function(){
		saveSettings();
		$('#settingsModal').modal('toggle');
		$('.navbar-collapse').collapse('hide'); 
	});

	//change handler to make sure range goes small>large
	$( "#qLowerRangeSelect" ).change(function() {
		var lowervalue=parseInt($( "#qLowerRangeSelect" ).val());
		$( "#qUpperRangeSelect" ).html(generateRangeList(lowervalue));
	});


	//start the timer
	$('#timer').timer({
    	format: '%M:%S'
	});

});

function drawGameOverScreen(){
	$("#refLabel").text("You have completed all sections in your bank");
	$("#refLabel").append("<h6>"+qLowerRange+" to "+qUpperRange+"</h6>");

	$("#questionLabel").text("Please relaunch to start again");

	$("#ansA").hide();
	$("#ansB").hide();
	$("#ansC").hide();
}	

function drawQuestion(num) {


	var shiftedNum=num-1;
	//array begins at 0 while qa begins at 1


	answered = false;//clear the answered state
	$("#refLabel").text(bank[shiftedNum].ref);
	//$("#refLabel").append("<h6>"+bank[shiftedNum].source+"</h6>");

	$("#questionLabel").text(bank[shiftedNum].question);

	$("#ansA>p").text(bank[shiftedNum].a);
	$("#ansB>p").text(bank[shiftedNum].b);
	$("#ansC>p").text(bank[shiftedNum].c);
	//clear the color codes
	$("#ansA").removeClass("list-group-item-success");
	$("#ansA").removeClass("list-group-item-danger");
	$("#ansB").removeClass("list-group-item-success");
	$("#ansB").removeClass("list-group-item-danger");
	$("#ansC").removeClass("list-group-item-success");
	$("#ansC").removeClass("list-group-item-danger");

    //save the correct answer 
    //in global variable so drawAnswer will work correctly
    
    if (bank[shiftedNum].ans=="a") {
    	correctAnswer = 0;
    }else if (bank[shiftedNum].ans=="b") {
    	correctAnswer = 1;
    }else if (bank[shiftedNum].ans=="c") {
    	correctAnswer = 2;
    }

    //save the current question queue to locastorage, so it can be resumed on relaunch
    localStorage.remainingQuestionArray=JSON.stringify(remainingQuestionArray);
    //retrieve using JSON.parse()
    localStorage.currentQuestion=JSON.stringify(num);

}

function drawAnswer(selected){

	var logoToAdd;
	var correct;

	if (!answered) {
		//this code only runs if the question is in unanswered state
		
		//run this first to prevent multi logging
		answered =true;

		//color code answers
		if (correctAnswer === 0) {

			$("#ansA").addClass("list-group-item-success");
			// $("#ansB").addClass("list-group-item-danger");
			// $("#ansC").addClass("list-group-item-danger");


		}else if(correctAnswer === 1) {

			$("#ansB").addClass("list-group-item-success");

			// $("#ansA").addClass("list-group-item-danger");
			// $("#ansC").addClass("list-group-item-danger");

		}else if(correctAnswer === 2) {

			$("#ansC").addClass("list-group-item-success");

			// $("#ansB").addClass("list-group-item-danger");
			// $("#ansA").addClass("list-group-item-danger");

		}

		//check answer

		if (selected==correctAnswer) {
			correct=true;
			logoToAdd="<span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span>";
		}else{
			correct=false;
			logoToAdd="<span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span>"
		}

		//add tick cross
		if (selected==0) {
			$("#ansA>p").append(logoToAdd);
			if (!correct) {$("#ansA").addClass("list-group-item-danger");}
		}else if (selected==1) {
			$("#ansB>p").append(logoToAdd);
			if (!correct) {$("#ansB").addClass("list-group-item-danger");}
		}else if (selected==2){
			$("#ansC>p").append(logoToAdd);
			if (!correct) {$("#ansC").addClass("list-group-item-danger");}
		}

		//also add tickcross to record and to local storage
		$("#answerRecord").append(logoToAdd);
		localStorage.streakChart = $("#answerRecord").html();

		//update stat counters
		totalQuestionCount++;
		if (correct){correctQuestionCount++;}
		percentCorrect=Math.round(100*(correctQuestionCount/totalQuestionCount));

		var statString= correctQuestionCount+"/"+totalQuestionCount+" @ "+percentCorrect+"%"
		
		$("#stats").text(statString);
		serverStatString=statString;




		if (correct) {
			streakCounter++;
			//check if this breaks local records
			//if it does save it to local
			var currentTime = new Date();
			if (localStorage.highScore === undefined) {
				localStorage.highScore=streakCounter;
				localStorage.recordDate=currentTime.toString();
			}else if (streakCounter>localStorage.highScore){
				localStorage.highScore=streakCounter;
				localStorage.recordDate=currentTime.toString();

				$("#personalBest").html(localStorage.highScore);
				$("#dateforPersonBest").html(localStorage.recordDate);
			}



		}else{
			console.log("data tripped");
			//when a streak is broken, check if it gets on the list, then submit it
			if ((serverData[9][1]!=undefined )&& (streakCounter>serverData[9][1])) {
				console.log("first layer passed");

				serverPostStreak();
			}else{
				streakCounter=0;
			}

		}


	}


}

function loadSettings() {
	//only load if settings exist
	if (!(localStorage.settingsPrimed === undefined)) {
	    $('#qLowerRangeSelect').val(localStorage.qLowerRangeSelect);
	    $('#qUpperRangeSelect').val(localStorage.qUpperRangeSelect);
	    $("#staffId").val(localStorage.staffId);


	    var randomOption;

	    if (localStorage.randomsequence==1) {
	    	randomOption=true;
	    	$("#randomOption").prop("checked", true);
	    	$("#notRandomOption").prop("checked", false);
	    }else{
	    	randomOption=false;
	    	$("#notRandomOption").prop("checked", true);
	    	$("#randomOption").prop("checked", false);
	    }


		qLowerRange=parseInt(localStorage.qLowerRangeSelect);
		qUpperRange=parseInt(localStorage.qUpperRangeSelect);
		staffId=localStorage.staffId;

		//load the compliant numbers into compliantNumberArray
		//based on settings
		//also mixes up the order if random is selected(unused)

		var arrayCache;

			//first list numbers sequentially from min to max
			arrayCache=questionRangeFromSections(qLowerRange,qUpperRange);

			if(randomOption){
				arrayCache=shuffle(arrayCache);
			}
			//now shuffle the array and deliver it (if random mode is on)
			remainingQuestionArray=arrayCache;




    }else{
    	arrayCache=range(1,1538);
		remainingQuestionArray=shuffle(arrayCache);
    }

    if (!(localStorage.highScore === undefined)) {

		$("#personalBest").html(localStorage.highScore);
		$("#dateforPersonBest").html(localStorage.recordDate);
    }





}

function saveSettings() {
	localStorage.settingsPrimed =1;
    localStorage.qLowerRangeSelect = $('#qLowerRangeSelect').val();
    localStorage.qUpperRangeSelect = $("#qUpperRangeSelect").val();
    localStorage.staffId = $('#staffId').val();

    if ($("#randomOption").is(":checked")) {
		localStorage.randomsequence=1;
    }else{
    	localStorage.randomsequence=0;
    }


    //clear out resumeState artifacts
    $("#answerRecord").html("");
    localStorage.streakChart="";


    //load it into the runtime variables
    loadSettings();

    
    //regenerate the next question here?
    drawNextQuestion();
}

function giveNextQuestion(){
	//ejects a number from the compliantNumberArray
	//returns a int, when array empty return undefined
	if(remainingQuestionArray.length>0){
		return remainingQuestionArray.shift();
	}

}

function randomQuestionNumber(){

	//returns a random question number filtered by settings
	var compliantNumber;
	var span=qUpperRange-qLowerRange;


	var arrayCache=officeArray;

	if(officeOnly){
		//delete all elements in the array above and below
		//filter values
		arrayCache=$.grep( arrayCache, function( n, i ) {
  			return n > qLowerRange;
		});

		arrayCache=$.grep( arrayCache, function( n, i ) {
  			return n < qUpperRange;
		});

		//now pick a random element from the filtered array
		var i = Math.floor(Math.random()*arrayCache.length);
		compliantNumber = arrayCache[i];
	}else{
		compliantNumber=Math.floor((Math.random() * span) + qLowerRange); 
	}

	return compliantNumber;
}

function drawNextQuestion(){
	//enable legacy mode

	if(true){



		var nextQuestion=giveNextQuestion();

		if (nextQuestion!=undefined){

			//questions remain, draw it
			drawQuestion(nextQuestion);
		}else{

			drawGameOverScreen();
			//also submit the streak when game is over
			serverPostStreak();
		}
	}else{

		drawQuestion(randomQuestionNumber());
	}
}

function generateRangeList(min){
	var optionsArray=["<option value=\"1\">1</option>",
	"<option value=\"2\">2</option>",
	"<option value=\"3\">3</option>",
	"<option value=\"4\">4</option>",
	"<option value=\"5\">5</option>",
	"<option value=\"6\">6</option>",
	"<option value=\"7\">7</option>",
	"<option value=\"8\">8</option>",
	"<option value=\"9\">9</option>",
	"<option value=\"10\">10</option>",
	"<option value=\"11\">11</option>",
	"<option value=\"12\">12</option>",
	"<option value=\"13\">13</option>",
	"<option value=\"14\">14</option>",
	"<option value=\"15\">15</option>",
	"<option value=\"16\">16</option>",
	"<option value=\"17\">17</option>",
	"<option value=\"18\">18</option>",
	"<option value=\"19\">19</option>",
	"<option value=\"20\" selected=\"selected\">20</option>"]

	var removeValue=min-1;

	//remove leftmost elements
	optionsArray.splice(0,removeValue);

	return optionsArray.join(" ");



}

function resumeExitState(){
	//load in the questions of last session
    if (!(localStorage.remainingQuestionArray=== undefined)) {
    	remainingQuestionArray = JSON.parse(localStorage.remainingQuestionArray);
    }
    if (!(localStorage.currentQuestion=== undefined)) {
    	drawQuestion(JSON.parse(localStorage.currentQuestion));
    }else{
    	//fallback to just drawing next question from the bank
		drawNextQuestion();
    }
    $("#answerRecord").html(localStorage.streakChart);


}

//online features
function serverPostStreak(){
if(navigator.onLine) 
{
	var stringtime =$("#timer").data('seconds');
	var rangeString = " "+qLowerRange+qUpperRange;

	var record = {
		streakCounter:streakCounter, 
		serverStatString:serverStatString,
		time:stringtime,
		staffId:staffId,
		rangeString:rangeString
	};

	var jsonString = JSON.stringify(record);

	// $.post( "http://shequiz-ceapas.rhcloud.com/save.php", { data: jsonString })
 //  		.done(function( data ) {
 //    		console.log(data );
 //  	});





	// 		if ((serverData.streakCounter!=undefined )&& (streakCounter>serverData[0][1])) {

	// 			serverPostStreak();
	// 		}



  	$.post( "http://shequiz-ceapas.rhcloud.com/oshc/load.php")
  		.done(function( data ) {
    		serverData=JSON.parse(data);
			//console.log(serverData);
			if ((serverData[9][1]!=undefined )&& (streakCounter>serverData[9][1])) {

					$.post( "http://shequiz-ceapas.rhcloud.com/oshc/save.php", { data: jsonString })
  		.done(function( data ) {
  			
    		console.log(data );
    		streakCounter=0;
  	});
			}

  		});

}
}

function serverGetStreak(){
	//returns the highest score currently
	//http://shequiz-ceapas.rhcloud.com/load.txt
if(navigator.onLine) 
{
$.post( "http://shequiz-ceapas.rhcloud.com/oshc/load.php")
  .done(function( data ) {
    serverData=JSON.parse(data);
		// //console.log(serverData);
		// $("#staffIdHS").html(serverData.staffId);
		// $("#streakHS").html(serverData.streakCounter);
		// $("#statsHS").html(serverData.serverStatString);
		// $("#dateHS").html(serverData.time);

		var recordBody=$("#recordsTableBody");

		$.each(serverData, function(i, item) {

		    var tr = $('<tr/>').appendTo(recordBody);
		    var rank = i+1;

		    tr.append('<td>' + rank + '</td>');
		    tr.append('<td>' + item[2] + '</td>');
		    tr.append('<td>' + item[1] + '</td>');
		    tr.append('<td>' + item[3] + '</td>');
		    tr.append('<td>' + item[6] + '</td>');


		}); //close each

		// recordsTable

  });//close done
}
}


function searchAndDisplay(refrenceNumber) {
	// body...

	var result;
	$.each(bank, function( index, value ) {
  		if(value.ref==refrenceNumber){
  			result=value.id;
  			drawQuestion(result);
  			return;
  		}
	});
}

//array utility functions
function shuffle(array) {
    var counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

function range(start, end) {
    var foo = [];
    for (var i = start; i <= end; i++) {
        foo.push(i);
    }
    return foo;
}

function questionRangeFromSections(startSection,endSection){
	//record which question each section starts on, ie: first section starts at rangeStartQuestion[1]
	//section				1  2   3   4   5   6   7   8   9  10  11  12   13   14   15   16   17   18   19   20  end   
	rangeStartQuestion = [0,1,51,115,203,331,404,542,581,680,732,798,921,1035,1063,1239,1364,1391,1441,1485,1509,1565];
	var endQuestion=rangeStartQuestion[endSection+1]-1;
	var foo=range(rangeStartQuestion[startSection],endQuestion);
	return foo;
}
