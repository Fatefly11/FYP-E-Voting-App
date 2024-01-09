export default function createData(candidateList, id: number) {
  const size = candidateList.Candidate.length;
  //vote Header consist of the candidate id (sorted from smallest to largest)
  let voteHeader = [];
  let voteData = new Array(size).fill(0);
  let voteMatch = false;
  try {
    for (let i = 0; i < size; i++) {
      voteHeader.push(parseInt(candidateList.Candidate[i].candidate_id));
    }
    // check null
    if (id == null) {
      throw new Error("Candidate ID empty");
    }

    //find the index of the candidate id and use the index to add the vote to the votedata array
    for (let i = 0; i < size; i++) {
      if (voteHeader[i] === id) {
        voteData[i] = 1;
        console.log("changes done");
        voteMatch = true;
      }
    }
    if (voteMatch == false) {
      throw new Error("Candidate ID not found");
    }
    // console.log(voteData);
    // console.log(voteHeader);
  } catch (err) {
    console.log(err);
  }
  console.log(voteData);
  return [voteHeader, voteData];
}

// export default function createData(candidateList, id: number) {
//   const size = candidateList.Candidate.length;

//   //vote Header consist of the candidate id (sorted from smallest to largest)
//   let voteHeader = [];
//   let voteData = [];
//   try {
//     for (let i = 0; i < size; i++) {
//       voteData.push(0);
//       voteHeader.push(candidateList.Candidate[i].candidate_id);
//     }
//     console.log(voteData);
//     console.log(voteHeader);
//     console.log("here");
//     if (id != null) {
//       for (let i = 0; i < size; i++) {
//         if (voteHeader[i] == id) {
//           voteData[i] = 1;
//           console.log("changes done");
//         }
//       }
//     }
//     console.log(voteData);
//     console.log(voteHeader);
//   } catch (err) {
//     console.log(err);
//   }
// }
