
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";

interface ArrayObj{data:any,apiEndpoint:any,status:any};
// let initialState:[] as ArrayObj[];
let errorarray: WritableDraft<[]> = [];
  export const sagaSlice = createSlice({
    name: 'sagaReducer',
    initialState:{
      errorObj:[]
    },
    reducers: {
            
            receiveAPIFailure: (state, action) => {
              // console.log(state.errorObj.length);
              console.log("receiveOnloadAPIFailure--",action.payload);
              //write code to check if element already in array.
              // action.payload.errorArr[1].apiEndpoint = "milestones";
              // console.log("after receiveOnloadAPIFailure--",action.payload);
              if(action.payload?.fromPage == "OnLoad"){
                state.errorObj = []
              }
              else if(action.payload?.fromPage == "Home")
              {
                if(action.payload?.errorArr?.length > 0)
                {
                  state.errorObj =action.payload?.errorArr;
                }else {
                  state.errorObj = []
                }
              }else {
                // if(action.payload?.errorArr?.length > 0)
                // {
                  action.payload.errorArr.map((value:any)=>{
                    const i = state.errorObj.findIndex(_item => _item.apiEndpoint === value.apiEndpoint);
                    if(i == -1){
                      state.errorObj.push(value) 
                    }
                  });
                // }else {
                //   state.errorObj = []
                // }
              }
              // console.log(state.errorObj.length);
            }
        }
    });
     export const {receiveAPIFailure} = sagaSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`

export default sagaSlice.reducer;
