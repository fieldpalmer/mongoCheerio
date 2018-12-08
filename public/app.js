
$.getJSON("/articles", function(data) {
 
    var source = $("#article-template").html();
    var template = Handlebars.compile(source);
    var html = template({data: data});
    $("#articles").html(html);

 
    // document.getElementById("text").innerHTML = html

  // for (var i = 0 ; i < data.length ;i++) {
  //   $("#articles").append(
  //     "<p data-id='" + data[i]._id + "'>" + 
  //       data[i].title + "<br />" + 
  //       data[i].link + 
  //     "</p>");
  // }
});

$(document).on("mouseenter", "#articleRow", function() {
  $("#notes").empty();
  //saves id of article being clicked
  const thisId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  }).then(function(data) {
    // console.log(data);
    
    // var source = $("#note-template").html();
    // var template = Handlebars.compile(source);
    // var html = template({data: data});
    // $("#notes").html(html);
    let articleTitle = $("<h3 class='p-2'>")
      .text(data.title);

    let noteTitle = $("<input id='titleinput' name='title'>")
      .attr("placeholder", "TITLE");

    let textArea = $("<textarea id='bodyinput' name='body'>")
      .attr("placeholder", "notes");

    let saveButton = $("<button class='btn-info' id='savenote'>")
      .attr("data-id", data._id)
      .text("Save Note");


    $("#notes").append(articleTitle);
    $("#notes").append(noteTitle);
    $("#notes").append(textArea);
    $("#notes").append(saveButton);
    // If there's a note already
    if (data.note) {
      // Place the title of the note in the title input
      $("#titleinput").val(data.note.title);
      // Place the body of the note in the body textarea
      $("#bodyinput").val(data.note.body);
    }
  });
});

$(document).on("click", "#savenote", function() {
  const thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  }).then(function(data) {
    console.log(data);
    $("#notes").empty();
  });

  $("#titleinput").val("");
  $("#bodyinput").val("");
});