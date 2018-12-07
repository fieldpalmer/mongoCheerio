
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

$(document).on("mouseover", "#articleRow", function() {
  $("#notes").empty();
  //saves id of article being clicked
  const thisId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  }).then(function(data) {
    console.log(data);
    $("#notes").append("<h2>" + data.title + "</h2>");
    $("#notes").append("<input id='titleinput' name='title' >");
    $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
    $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
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