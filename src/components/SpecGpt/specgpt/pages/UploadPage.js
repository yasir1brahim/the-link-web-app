import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { BASE_URL } from '../utils/config';
import styled from "styled-components";
import { Circle } from "rc-progress";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { ImCancelCircle } from "react-icons/im";
import { FcCheckmark } from "react-icons/fc";
import Uploady, {
    useUploady,
    useBatchAddListener,
    useItemFinalizeListener,
    useItemProgressListener,
    useAbortItem,
    FILE_STATES,
    useFileInput,
} from "@rpldy/uploady";
import { getMockSenderEnhancer } from "@rpldy/mock-sender";
import UploadButton from "@rpldy/upload-button";
//import { asUploadButton } from "@rpldy/upload-button";

const MAX_COUNT = 300;

const mockSenderEnhancer = getMockSenderEnhancer({ delay: 1500 });
const StyledCircle = styled(Circle)`
  width: 36px;
  height: 36px;
  margin-right: 10px;
`;

const ItemProgress = memo(({ id }) => {
  const { completed } = useItemProgressListener(id) || { completed: 0 };

  return (
    <StyledCircle
      percent={completed}
      strokeWidth={2}
      trailColor="rgb(175,180,176)"
      strokeColor={{
        "0%": "#ffecb1",
        "100%": "#9eea9e"
      }}
    />
  );
});

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  justify-content: flex-start;
`;

const ItemName = styled.span`
  display: inline-block;
  margin: 0 10px;

  ${({ $aborted }) => ($aborted ? "color: gray;" : undefined)}
  ${({ $success }) => ($success ? "color: green;" : undefined)}
`;

const UploadListItem = ({ item }) => {
  const [itemState, setState] = useState(item.state);

  const abortItem = useAbortItem();

  useItemFinalizeListener((item) => {
    setState(item.state);
  }, item.id);

  const isAborted = itemState === FILE_STATES.ABORTED,
    isSuccess = itemState === FILE_STATES.FINISHED,
    isFinished = ![FILE_STATES.PENDING, FILE_STATES.UPLOADING].includes(
      itemState
    );

  const onAbortItem = () => {
    abortItem(item.id);
  };

  return (
    <ItemWrapper>
      {!isFinished && <ItemProgress id={item.id} />}
      {isAborted && <ImCancelCircle size={36} color="gray" />}
      {isSuccess && <FcCheckmark size={36} />}
      <ItemName $aborted={isAborted} $success={isSuccess}>
        {item.file.name}
      </ItemName>
      {!isFinished && <RiDeleteBin2Fill size={32} onClick={onAbortItem} />}
    </ItemWrapper>
  );
};



const ListContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  margin-top: 20px;
`;

const UploadList = () => {
  const { processPending } = useUploady();
  const [items, setItems] = useState([]);

  useBatchAddListener((batch) => {
    setItems((items) => items.concat(batch.items));
  });

  return (
    <ListContainer>
      {items.map((item) => (
        <UploadListItem key={item.id} item={item} />
      ))}

      {items.length ? <button onClick={processPending}>Upload</button> : null}
    </ListContainer>
  );
};

const MyForm = () => {
    const inputRef = useRef();
    useFileInput(inputRef);

    return <input type="file" name="testFile" multiple style={{ display: "none" }} ref={inputRef}/>
}




const MyForm3 = ({showWebkit}) => {
    const inputRef3 = useRef();
    useFileInput(inputRef3);

    return <input type="file" name="testFile" multiple  ref={inputRef3}/>
}

const MyForm4 = ({showWebkit}) => {
    const inputRef4 = useRef();
    useFileInput(inputRef4);
    if (inputRef4.current) {
        inputRef4.current.setAttribute("webkitdirectory", "true");
    }
    return <input type="file" name="testFile" multiple  ref={inputRef4}/>
}


const UploadPage = ({token}) => {
    
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileLimit, setFileLimit] = useState(false);
    const [userDocs, setUserDocs] = useState([]);

    const handleFileEvent = (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files)
        handleUploadFiles(chosenFiles);
    }

    const handleUploadFiles = (files) => {
        const uploaded = [...uploadedFiles];
        let limitExceeded = false;
        files.some((file) => {
            if (uploaded.findIndex((f) => f.name === file.name) === -1) {
                // file is not already in the list
                console.log('file< ', file);
                uploaded.push(file);
                if (uploaded.length === MAX_COUNT) setFileLimit(true);
                if (uploaded.length > MAX_COUNT) {
                    alert(`you can only upload ${MAX_COUNT} files at a time.`);
                    setFileLimit(false);
                    limitExceeded = true;
                    return true;
                }
            }
        });
        if (!limitExceeded) setUploadedFiles(uploaded);
    }

    const loadUserDocs = async () => {
        const url =`${BASE_URL}/api/docs`;
        try {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token,
                }
            });
            const data = await response.json();
            if (data.success) {
                console.log(data);
                setUserDocs(data.docs);
            }            
        } catch (error) {
            console.log('error: ', error);
        }
    }


    useEffect(() => {
        loadUserDocs();
    }, [])

    const fileTypeFilter = useCallback((file) => {
        return file.type === 'application/pdf';
    }, []);
    
    const [allowFolderUpload, setAllowFolderUpload] = useState(true);

    return (

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                <div style={{order: '1', marginTop: '5%'}}>
                    <h1>Upload</h1>

                    <p>Add files and folders you want to upload to SpecGPT. </p>
                </div>


                <div style={{order: '10', marginTop: '5%'}}>             
                    <Uploady 
                        autoUpload={false}
                        fileFilter={fileTypeFilter}
                        grouped={true}
                        maxGroupSize={300}
                        accept='application/pdf'
                        destination={{ url: `${BASE_URL}/api/upload`,
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }}
                    >
                        <UploadButton>Add Files</UploadButton>
                        <UploadList />
                    </Uploady>
                </div>
                
                <div style={{order: '30', marginTop: '5%'}}>
                    <h5>Uploaded Docs</h5>
                    {userDocs.map((doc, index) => {
                        return (
                            <div key={index}>{doc.filename}</div>
                        )
                    })}
                </div>

                

                {/***
                <div style={{order: '20', marginTop: '5%'}}>
                    <h3>Files and folders</h3>

                    <div>
                        <input type="file" 
                            multiple 
                            accept='application/pdf'
                            onChange={(e) => handleFileEvent(e)}
                            disabled={fileLimit}
                            title=""
                            value=""                    
                        />
                    </div>

                    <div>
                        <input type="file"                        
                            directory="true"
                            webkitdirectory="true"
                            mozdirectory="true"
                            accept='application/pdf'
                        />                    
                    </div>
                </div>

                <div style={{order: '3', marginTop: '1%'}}>
                    {uploadedFiles.map(file => (
                        <div>
                            {file.name}
                        </div>
                    ))}
                </div>
                ***/}


            </div>
        </div>
    )
}

export default UploadPage;