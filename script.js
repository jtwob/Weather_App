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

        let searchQ = "https://api.openweathermap.org/data/2.5/forecast?q=" + updateCity(query) + "&units=imperial&appid=b8cf73639b0d81c1905ba1ac1cb6f289";
        fetch(searchQ)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                let date = moment(data.list[4].dt_txt).subtract(1, 'days').format("L");

                $("#city-text").text(query + " " + date);
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
                $("#card-row").empty();
                for (let i = 6; i < data.list.length; i += 8) {
                    cardCreator(data.list[i]);
                }
            })
    }

    let cardCreator = function (data) {
        let iconcode = data.weather[0].icon;

        let card = $("<div>");
        let cardBody = $("<div>");
        let cardHeader = $("<h5>");
        let cardIcon = $("<img>");
        let cardTemp = $("<p>");
        let cardHum = $("<p>");

        card.attr("style", "width: 10rem; margin-right: 4px;");
        card.addClass("card");
        cardBody.addClass("card-body card-days");
        cardHeader.addClass("card-title");
        cardIcon.attr("src", "http://openweathermap.org/img/w/" + iconcode + ".png");

        cardHeader.text(moment(data.dt_txt).format("L"));
        cardTemp.text("Temp: " + data.main.temp + " °F");
        cardHum.text("Humidity:" + data.main.humidity + "%");

        cardBody.append(cardHeader);
        cardBody.append(cardIcon);
        cardBody.append(cardTemp);
        cardBody.append(cardHum);
        card.append(cardBody);
        $("#card-row").append(card);
    }

})
