import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios";
import { toast, ToastContainer } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { get } from "lodash";
import NavbarTop from "../shared/NavbarTop/NavbarTop";

import { Button } from "reactstrap";
import SelectDropDownV2 from "../shared/SelectDropDownV2/SelectDropDownV2";
import ExportToProcoreModal from "./exportToProcoreModal";

const SubmittalMappings = () => {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId");
  const [linkSubMappings, setLinkSubMappings] = useState([]);
  const [procoreSubTypes, setProcoreSubTypes] = useState([]);
  //   const [procoreSubDropDownMappings, setProcoreSubDropDownMappings] = useState([]);
  const [onEdit, setOnEdit] = useState(false);
  const [linkAndProcoreMappingsArray, setLinkAndProcoreMappingsArray] =
    useState([]);
  const [openExportToProcoreModal, setOpenExportToProcoreModal] =
    useState(false);
  const [allMappings, setAllMappings] = useState({});
  //   const [selectedProcoreSubmittal, setSelectedProcoreSubmittal] = useState();

  useEffect(() => {
    const handleSubmittalMappings = async () => {
      try {
        await axiosInstance({
          method: "get",
          url: `procore/submittal_mapping/${customerId}`,
        }).then((res) => {
          setLinkSubMappings(get(res, "data.data.link_sub_mapping"));
          setProcoreSubTypes(get(res, "data.data.procore_submittal_types"));
          setAllMappings(get(res, "data.data"));
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

  // function used to map the procore submittals to link subimttals
  const onSelectProcoreDropdown = (linkId, procoreId) => {
    // if the mapping array has some values in it scan and update else just push the mappings
    if (linkAndProcoreMappingsArray && linkAndProcoreMappingsArray.length > 0) {
      // search the array for the link id and update it with the new procoreId
      const indexForLinkId = linkAndProcoreMappingsArray.find(
        (key) => key[0] === linkId
      );
      if (indexForLinkId && procoreId) {
        setLinkAndProcoreMappingsArray(
          linkAndProcoreMappingsArray.splice(indexForLinkId, 1, procoreId.id)
        );
      } else if (procoreId) {
        setLinkAndProcoreMappingsArray(
          linkAndProcoreMappingsArray.push([linkId, procoreId.id])
        );
      }
    } else if (procoreId) {
      // pusht the values directly in the empty array
      setLinkAndProcoreMappingsArray([[linkId, procoreId.id]]);
    }
  };

  const procoreMappings = async () => {
    const mappingsobject = { mappings: [] };
    // const mappingsObjectItems = {
    //     "id" : 0,
    //     "link_submittal": "",
    //     "procore_type": ""
    // };
    // need to map the mappingsObjectItems and send it in the api
    try {
      await axiosInstance({
        method: "post",
        url: `procore/submittal_mapping/${customerId}`,
        data: mappingsobject,
      }).then((res) => {
        if (get(res, "status") === 200) {
          setOpenExportToProcoreModal(true);
        }
        return res;
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

  return (
    <div className="page-wrap">
      <NavbarTop />
      {openExportToProcoreModal && allMappings && (
        <ExportToProcoreModal mappings={allMappings}></ExportToProcoreModal>
      )}
      <div className="position-button-wrap">
        <div className="button-wrap">
          <Button onClick={() => setOnEdit(true)}>Edit</Button>
          <Button onClick={() => procoreMappings()}>
            {" "}
            Looks Good! Continue
          </Button>
        </div>
      </div>
      <div className="project-logs-wrapper log-table-width submittal-table">
        <table>
          <tbody>
            <tr>
              <th>Submittal Types from Link</th>
              <th>Submittal Types from Procore</th>
            </tr>
            {linkSubMappings.length > 0 &&
              linkSubMappings.map((x, k) => (
                <tr key={k}>
                  {/**link submittal types column 1 */}
                  <td>{get(x, "link_submittal")}</td>
                  {!onEdit && <td>{get(x, "procore_type")}</td>}
                  {/**procore submittal types column 2 */}
                  {procoreSubTypes && procoreSubTypes.length > 0 && onEdit ? (
                    <td>
                      <SelectDropDownV2
                        options={procoreSubTypes}
                        onChange={(e) =>
                          onSelectProcoreDropdown(k, get(e, `[0]`))
                        }
                      />
                    </td>
                  ) : (
                    <td>{get(x, `procore_submittal_types`)}</td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
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
