import React, { useState, useEffect } from "react";
import axios from "axios";

const Form = () => {
  const [country, setCountry] = useState([]);

  useEffect(() => {
    const countryData = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        setCountry(response.data);
		
      } catch (error) {
        console.log("Issues in fatching API");
      }
    };

    countryData();
  }, []);

  useEffect(() => {
    console.log(country);
  }, [country]);

  return (
    <div className="flex justify-center items-center flex-col">
      <form className="bg-slate-400 w-3/5 h-[200px] mt-5 flex flex-col p-5 rounded-md ">
        <div>
          <label>Name</label>
          <input type="text" className="ml-2 rounded-md" />
        </div>

        <div className="mt-3">
          <label>Country</label>
          <select className="w-1/4 h-8 rounded-md  ml-2 ">
            {country.map((country, index) => (
              <option key={index} value={country.name.common}>
                {country.name.common}
              </option>
            ))}
          </select>
        </div>

      </form>

    </div>
  );
};

export default Form;
