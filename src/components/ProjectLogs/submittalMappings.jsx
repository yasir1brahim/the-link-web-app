import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios";
import { toast, ToastContainer } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { get } from "lodash";
import NavbarTop from "../shared/NavbarTop/NavbarTop";
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";

const SubmittalMappings = () => {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId");
  const [linkSubMappings, setLinkSubMappings] = useState([]);
  const [procoreSubTypes, setProcoreSubTypes] = useState([]);

  useEffect(() => {
    const handleSubmittalMappings = async () => {
      try {
        await axiosInstance({
          method: "get",
          url: `procore/submittal_mapping/${customerId}`,
        }).then((res) => {
          setLinkSubMappings(get(res, "data.data.link_sub_mapping"));
          setProcoreSubTypes(get(res, "data.data.procore_submittal_types"));
        });
      } catch (error) {
        toast.error("Something went wrong!", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    };

    if (customerId) {
      handleSubmittalMappings();
    }
  }, [customerId]);

  return (
    <div className="page-wrap">
      <NavbarTop />
      <div className="project-logs-wrapper log-table-width submittal-table">
        <table>
        <tbody>

        <tr>
          <th>Submittal Types from Link</th>
          <th>Submittal Types from Procore</th>
        </tr>
          {linkSubMappings.length > 0 &&
            linkSubMappings.map((x) => (
              <tr>
              <td>
                {get(x, "link_submittal")}
              </td>
              <td><SelectDropdown options={[
                {label: 'Test 1', value: 0},
                {label: 'Test 2', value: 1}
              ]}/></td>
              </tr>
            ))}
        </tbody>
        </table>

        {procoreSubTypes.length > 0 && procoreSubTypes.map((x) => <>get(x)</>)}
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default SubmittalMappings;
