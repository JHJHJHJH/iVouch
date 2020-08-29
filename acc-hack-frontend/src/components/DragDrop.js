import React, { useMemo, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

const baseStyle = {
  flex: 1,
  width: "60%",
  height: "150px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "40px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out"
};

const activeStyle = {
  borderColor: "#2196f3"
};

const acceptStyle = {
  borderColor: "#00e676"
};

const rejectStyle = {
  borderColor: "#ff1744"
};


// const thumbsContainer = {
//   display: "flex",
//   flexDirection: "row",
//   flexWrap: "wrap",
//   marginTop: 16
// };

// const thumb = {
//   display: "inline-flex",
//   borderRadius: 2,
//   border: "1px solid #eaeaea",
//   marginBottom: 8,
//   marginRight: 8,
//   width: "auto",
//   height: 200,
//   padding: 4,
//   boxSizing: "border-box"
// };

// const thumbInner = {
//   display: "flex",
//   minWidth: 0,
//   overflow: "hidden"
// };

// const img = {
//   display: "block",
//   width: "auto",
//   height: "100%"
// };

export default function DragDrop(props) {
  const [files, setFiles] = useState([" "]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
    open
  } = useDropzone({
    accept: "image/*, .pdf",
    noClick: true,
    noKeyboard: true,
    onDrop: acceptedFiles => {
      setFiles(
        acceptedFiles.map(file =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
        
      );
    } 
    
  });
  


  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }),
    [isDragActive, isDragReject]
  );

//   const thumbs = files.map(file => (
//     <div style={thumb} key={file.name}>
//       <div style={thumbInner}>
//         <img src={file.preview} style={img} />
//       </div>
//     </div>
//   ));

//   useEffect(
//     () => () => {
//       // Make sure to revoke the data uris to avoid memory leaks
//       files.forEach(file => URL.revokeObjectURL(file.preview));
//     },
//     [files]
//   );

  const filepath = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
      <>
    <h4>{props.type}</h4>
    <div className="container" >
      <div {...getRootProps({ style })}>
          
        <input {...getInputProps()} />
        <p>Drop {props.type}s here</p>
        <button type="button" onClick={open}>
          Browse
        </button>
      </div>
      <aside>
        <h6>{props.type}s uploaded</h6>
        <ul>{filepath}</ul>
      </aside>
      {/* <aside style={thumbsContainer}>{thumbs}</aside> */}
    </div>
    </>
  );
}