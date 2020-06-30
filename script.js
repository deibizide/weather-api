class getWeatherAPI {
    constructor() {
        this.apiURL = 'https://www.metaweather.com/api/location';
        this.addCorsHeader();
    }

    addCorsHeader() {
        jQuery.ajaxPrefilter(function (options) {
            if (options.crossDomain && jQuery.support.cors) {
                options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
            }
        });
    }

    getLocation(query, callback) {
        const url = `${this.apiURL}/search/`;
        const params = {
            query: query,
        };

        $.getJSON(url, params)
            .done(data => {
                callback(data);
            })
            .fail(function () {
                callback(null);
            });
    }

    getWeatherData(location, callback) {
        const url = `${this.apiURL}/${location.woeid}`;
        console.log(url);

        $.get(url)
            .done(data => {
                callback(data);
            })
            .fail(data => {
                callback(null);
            });
    }
}

class ShowWeather {
    constructor() {
        this.getWeatherAPI = new getWeatherAPI();
        this.query = $('#query');
        this.form = $('#weather-form');
        this.imageURL = 'https://www.metaweather.com/static/';

        this.registerEventHandler();
    }
    registerEventHandler() {
        this.form.on('submit', e => {
            e.preventDefault();

            const query = this.query.val().trim();

            this.getWeatherAPI.getLocation(query, location => {
                if (location === null) {
                    this.showError('Could not find this location. Please try again.');
                } else {
                    this.getWeatherAPI.getWeatherData(location[0], data => {
                        if (data === null) {
                            this.showError('Could not load the weather data. Please try again');
                        } else {
                            this.showData(data);
                        }
                    });
                }
            });
        });
    }

    showError(message) {
        const error = $('#error');
        console.log('error');

        if (error.length === 0) {
            $('#results').prepend(`
        <div class="alert alert-danger" role="alert" id="error">
          ${message}
        </div>
      `);
        } else {
            console.error(message);
        }
    }

    showData(data) {
        const {
            weather_state_name,
            humidity,
            wind_speed,
            the_temp,
            weather_state_abbr,
            predictability,
            applicable_date,
            air_pressure,
            min_temp,
            max_temp,
        } = data.consolidated_weather[0];

        $('#results').html(``);
        $('#header').html(`
          <div class="container d-flex flex-column justify-content-between flex-md-row">
            <div class="align-items-center col-12 col-md-4 d-flex flex-column justify-content-between weather-card">
            <div class="weather-gradient"></div>
                <div class="weather-info d-flex flex-column justify-content-between align-items-center text-black-50 text-center">
                    <h2 class="date-dayname">${moment(applicable_date).format('dddd')}</h2>
                    <span class="date-day">${moment(applicable_date).format('MMM Do YY')}</span>
                    <span class="location">${data.title}</span>
                    <img class="w-25"src="${this.imageURL}img/weather/${weather_state_abbr}.svg" />
                    <h1 class="weather-temp">${Math.round(the_temp)} <span>°C</span></h1>
                    <h3 class="weather-desc">${weather_state_name}</h3>
                </div>
            </div>
            <div class="d-flex flex-column justify-content-between col-md-8">
                <div class="today-info-container">
                    <div class="today-info d-flex flex-column">
                        <div>
                            <span class="title">PREDICTABILITY</span><span class="value">${predictability} %</span>
                        </div>
                        <div>
                            <span class="title">HUMIDITY</span><span class="value">${humidity}%</span>
                        </div>
                        <div>
                            <span class="title">WIND</span><span class="value">${Math.round(wind_speed)} km/h</span>
                        </div>
                          <div>
                            <span class="title">AIR PRESSURE</span><span class="value">${air_pressure} mb</span>
                        </div>
                          <div>
                            <span class="title">MAX TEMP</span><span class="value">${Math.round(max_temp)}°</span>
                        </div>
                          <div>
                            <span class="title">MIN TEMP</span><span class="value">${Math.round(min_temp)}°</span>
                        </div>
                    </div>
                </div>
                    <div class="week-container" >
                         <ul class="week-list d-flex justify-content-between week-list p-0"  id="results"></ul>
                    </div>
            </div>
        </div>
        `);

        data.consolidated_weather.forEach((item, i) => {
            const date = item.applicable_date;
            const humidity = item.humidity;
            const maxTemp = item.max_temp;
            const weekDay = moment(item.applicable_date).format('dddd').substring(0, 3);
            if (i < 1) return;

            $('#results').append(`
            <li class="weather-day text-center p-2">
                <img class="small-icon" src="${this.imageURL}img/weather/${item.weather_state_abbr}.svg" />
                <span class="day-name">${weekDay}</span>
                <span class="day-temp">${Math.round(item.the_temp)}&deg</span>
            </li>
      `);
        });
    }
}

const tryIt = new ShowWeather();
