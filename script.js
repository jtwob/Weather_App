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
            searchEntry.text(capitalize(input));
            $("#search-history").prepend(searchEntry);
            searchValues++;
        }
        fetchHelper(input);
    });

    $("#search-history").on("click", ".history-item", function () {
        fetchHelper(this.textContent);
    })

    $("#search-history").mouseover(function (e) {
        $(".hover").removeClass("hover");
        $(e.target).addClass("hover");
        return false;
    })

    $("#search-history").mouseout(function (e) {
        $(e.target).removeClass("hover");
    });

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

    let fetchWeather = function (query) {
        let searchWeather = "https://api.openweathermap.org/data/2.5/weather?q=" + updateCity(query) + "&units=imperial&appid=b8cf73639b0d81c1905ba1ac1cb6f289";
        fetch(searchWeather)
            .then(response => response.json())
            .then(data => {
                let date = moment(data.dt * 1000).format("L");
                $("#city-text").text(capitalize(query) + " " + date);
                $("#temp").text("Temperature: " + data.main.temp + " °F");
                $("#humidity").text("Humidity: " + data.main.humidity + "%");
                $("#wind").text("Wind Speed: " + data.wind.speed + "mph");
            })


    }

    let fetchForecast = function (query) {
        let timeSetter;
        let searchForecast = "https://api.openweathermap.org/data/2.5/forecast?q=" + updateCity(query) + "&units=imperial&appid=b8cf73639b0d81c1905ba1ac1cb6f289";
        fetch(searchForecast)
            .then(response => response.json())
            .then(data => {
                fetchUV(data.city.coord.lat, data.city.coord.lon);
                $("#card-row").empty();
                for (let i = 0; i < 8; i++) {
                    let time = moment(data.list[i].dt_txt).utcOffset(8).toString();
                    timeArr = time.split(" ");
                    if (timeArr[4] === "13:00:00") {
                        timeSetter = i;
                    }
                }
                for (let i = timeSetter; i < data.list.length; i += 8) {
                    cardCreator(data.list[i]);
                }
            })
    }

    let fetchUV = function (lat, lon) {
        let searchUV = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=b8cf73639b0d81c1905ba1ac1cb6f289";
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
            })
    }

    let fetchHelper = function (query) {
        fetchWeather(query);
        fetchForecast(query);
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
        cardIcon.attr("src", "https://openweathermap.org/img/w/" + iconcode + ".png");

        cardHeader.text(moment(data.dt_txt).format("L"));
        cardTemp.text("Temp: " + data.main.temp + " °F");
        cardHum.text("Humidity: " + data.main.humidity + "%");

        cardBody.append(cardHeader);
        cardBody.append(cardIcon);
        cardBody.append(cardTemp);
        cardBody.append(cardHum);
        card.append(cardBody);
        $("#card-row").append(card);
    }

    let capitalize = function (str) {
        let arr = str.split(" ");
        let result = "";
        for (let i = 0; i < arr.length; i++) {
            let size = arr[i].length;
            for (let j = 0; j < size; j++) {
                if (j === 0) {
                    result += arr[i][j].toUpperCase();
                } else {
                    result += arr[i][j].toLowerCase();
                }
            }
            if (i + 1 !== arr.length) {
                result += " ";
            }
        }
        return result;
    }
})
