$(document).ready(function () {
    //Declaration of globals
    let searchValues = 0;
    //Meant to hide result panel until 1 query has been made
    $("#city-banner").toggle();

    //form listener for searchbar and search history
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

    //grabs search from search history element and executes
    $("#search-history").on("click", ".history-item", function () {
        fetchHelper(this.textContent);
    })

    //mouseover/hover coloration of search history element
    $("#search-history").mouseover(function (e) {
        $(".hover").removeClass("hover");
        $(e.target).addClass("hover");
        return false;
    })

    //removes hover coloration on mouseout
    $("#search-history").mouseout(function (e) {
        $(e.target).removeClass("hover");
    });

    /**
     * Update city is a parser that adds + symbols in place of spaces, for url management
     * @param {String} query The query city/country
     */
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

    /**
     * Fetch function for today's weather data. Populates html with relevant data
     * @param {String} query The query city/country
     */
    let fetchWeather = function (query) {
        let searchWeather = "https://api.openweathermap.org/data/2.5/weather?q=" + updateCity(query) + "&units=imperial&appid=b8cf73639b0d81c1905ba1ac1cb6f289";
        fetch(searchWeather)
            .then(response => response.json())
            .then(data => {
                let date = moment(data.dt * 1000).format("L");
                $("#city-text").text(capitalize(query) + " " + date);
                $("#today-icon").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
                $("#temp").text("Temperature: " + data.main.temp + " °F");
                $("#humidity").text("Humidity: " + data.main.humidity + "%");
                $("#wind").text("Wind Speed: " + data.wind.speed + "mph");
            })
    }

    /**
     * Fetch function for 5 day forecast. Populates html with relevant data. Also calls fetchUV function as the coordinates supplied from the forecast are required.
     * @param {String} query The query city/country
     */
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

    /**
     * Fetch function for UV index data. Populates html with relevant data, colorizes UV index based on severity. Called in fetchForecast wher lat and lon are retrieved.
     * @param {String} lat the latitude of the UV data
     * @param {String} lon the longitude of the UV data
     */
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

    /**
     * Helper function calls all fetch functions
     * @param {String} query The query city/country
     */
    let fetchHelper = function (query) {
        fetchWeather(query);
        fetchForecast(query);
    }

    /**
     * cardCreator is passed one object from a specific timestamp to create and populate a card with the relevant data, and append to the html
     * @param {Object} data individual timestamp returned from the openweather api
     */
    let cardCreator = function (data) {
        let iconcode = data.weather[0].icon;

        let card = $("<div>");
        let cardBody = $("<div>");
        let cardHeader = $("<h5>");
        let cardIcon = $("<img>");
        let cardTemp = $("<p>");
        let cardHum = $("<p>");

        card.attr("style", "width: 10rem; margin-right: 4px;");
        card.addClass("card card-outer");
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

    /**
     * capitalize normalizes search strings for city/country capitalization conventions 
     * @param {String} str search term
     */
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
