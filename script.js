$(document).ready(function () {
    let searchValues = 0;
    $("#city-banner").toggle();

    $("form").on("submit", function (e) {
        e.preventDefault();
        let searchEntry = $("<li>");
        let input = $("#city-search").val();

        if (searchValues === 0) {
            $("#city-banner").toggle();
        }
        if (input !== "") {
            searchEntry.attr("class", "list-group-item history-item");
            searchEntry.attr("data-value", searchValues);
            searchEntry.text(input);
            $("#search-history").prepend(searchEntry);
            searchValues++;
        }
        fillBanner(input);
        let q = updateCity(input);
        console.log(q)
    });

    $("#search-history").on("click", ".history-item", function () {
        fillBanner(this.textContent);
        let reSearch = updateCity(this.textContent);
        console.log(reSearch);
    })

    let updateCity = function (query) {
        let words = query.split(" ");
        let city = "";
        for (let i = 0; i < words.length; i++) {
            city += words[i];
            if (i + 1 !== words.length) {
                city += "+";
            }
        }
        return city;
    }

    let fillBanner = function (query) {
        $("#city-text").text(query);

        let searchQ = "https://api.openweathermap.org/data/2.5/forecast?q=" + updateCity(query) + "&units=imperial&appid=b8cf73639b0d81c1905ba1ac1cb6f289";
        fetch(searchQ)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                $("#temp").text("Temperature: " + data.list[4].main.temp + " °F");
                $("#humidity").text("Humidity: " + data.list[4].main.humidity + "%");
                $("#wind").text("Wind Speed: " + data.list[4].wind.speed + "mph");

                let searchUV = "http://api.openweathermap.org/data/2.5/uvi?lat=" + data.city.coord.lat + "&lon=" + data.city.coord.lon + "&appid=b8cf73639b0d81c1905ba1ac1cb6f289";
                fetch(searchUV)
                    .then(response => response.json())
                    .then(data => {
                        $("#uv").text(data.value);
                        if (data.value <= 2) {
                            $("#uv").attr("class", "safe");
                        } else if (data.value <= 5) {
                            $("#uv").attr("class", "moderate");
                        } else if (data.value <= 7) {
                            $("#uv").attr("class", "high");
                        } else if (data.value <= 10) {
                            $("#uv").attr("class", "v-high");
                        } else if (data.value > 10) {
                            $("#uv").attr("class", "extreme");
                        }
                        console.log(data);
                    })
            })
    }
})
