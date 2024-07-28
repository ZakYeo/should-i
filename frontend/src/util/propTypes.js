import PropTypes from "prop-types";

export const ShouldIPropTypes = {
  loading: PropTypes.bool,
  shouldWearCoat: PropTypes.bool,
};

export const CommentSectionPropTypes = {
  lat: PropTypes.number,
  lon: PropTypes.number,
  setLatLon: PropTypes.func,
  customLocation: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  setCustomLocation: PropTypes.func,
  loading: PropTypes.bool,
};

export const MapComponentPropTypes = {
  lat: PropTypes.number,
  lon: PropTypes.number,
  updateLocation: PropTypes.func,
};

export const WeatherCardPropTypes = {
  weatherData: PropTypes.shape({
    main: PropTypes.string,
    temp: PropTypes.number,
    wind: PropTypes.shape({
      speed: PropTypes.number,
    }),
    humidity: PropTypes.number,
    feels_like: PropTypes.number,
    description: PropTypes.string,
  }),
  lat: PropTypes.number,
  lon: PropTypes.number,
  loading: PropTypes.bool,
};
