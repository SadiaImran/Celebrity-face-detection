Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Drop files here or click to upload",
        autoProcessQueue: false
    });

    dz.on("addedfile", function() {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]);
        }
    });

    dz.on("complete", function(file) {
        let imageData = file.dataURL;

        if (!imageData) {
            console.error("No image data found!");
            return;
        }

        var url = "http://127.0.0.1:5000/classify_image";
        
        $.post(url, { image_data: imageData }, function(data, status) {
            console.log("Received data: ", data, status);

            // Hide result holder and clear content
            $("#resultHolder").hide(); 
            $("#error").hide(); 
            $("#content").html('');

            if (!data || data.length === 0) {
                $("#error").text("No face detected or less than two eyes detected").show();
                $("#content").html('');
                return;
            }
            
            let matches = [];  
            let threshold = 40; 

            for(let i = 0; i < data.length; i++){
                let maxScoreForThisClass = Math.max(...data[i].class_probability);

                if(maxScoreForThisClass >= threshold){
                    matches.push(data[i]);
                }
            }

            if(matches.length > 0){
                $("#error").hide();
                $("#resultHolder").show();

                // Generate a table for each match
                matches.forEach((match, index) => {
                    let playerId = match.class;
                    let playerContent = $(`#${playerId}`).clone();
                    $("#content").append(playerContent);

                    playerContent.append(`<p class="mt-4">Confidence Score: ${Math.max(...match.class_probability)}%</p>`);

                    let classDictionary = match.class_dictionary;
                    
                    // Clone the table template
                    let clonedTable = $("#divClassTable").clone();
                    clonedTable.attr("id", `classTable_${index}`); 
                    clonedTable.css("display", "table");
                    clonedTable.find("tbody").empty();

                    // Populate the table rows with data
                    for (let personName in classDictionary) {
                        let index = classDictionary[personName];
                        let probab_score = match.class_probability[index] + " %";

                        let row = `<tr>
                            <td class="px-4 py-2 border-r-2 border-gray-300">${personName}</td>
                            <td class="px-4 py-2">${probab_score}</td>
                        </tr>`;
                        clonedTable.find("tbody").append(row);
                    }

                    // Append the cloned and populated table to the content
                    $("#content").append(clonedTable);
                });

            } else {
                $("#error").text("No significant matches found").show();
            }
        }).fail(function(err) {
            console.error("Error in AJAX request: ", err);
            let errorMsg = "An error occurred. Please try again.";
            if (err.status === 400 && err.responseJSON && err.responseJSON.error) {
                errorMsg = err.responseJSON.error;
            }
            $("#error").text(errorMsg).show();
        });
    });

    $('#submitBtn').on("click", function(e) {
        dz.processQueue();
    });
}

$(document).ready(function() {
    console.log("ready!");
    $("#error").hide();
    $("#divClassTable").hide(); 
    $("#resultHolder").hide();

    init();
});
