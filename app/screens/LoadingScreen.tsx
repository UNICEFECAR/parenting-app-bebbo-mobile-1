import FocusAwareStatusBar from '@components/FocusAwareStatusBar';
import { RootStackParamList } from '@navigation/types';
import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DateTime } from 'luxon';
import React, { useContext, useEffect } from 'react';
import { Alert, BackHandler, Dimensions } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { useAppDispatch, useAppSelector } from '../../App';
import LoadingScreenComponent from '../components/LoadingScreenComponent';
import useNetInfoHook from '../customHooks/useNetInfoHook';
import { dataRealmCommon } from '../database/dbquery/dataRealmCommon';
import { ActivitiesEntitySchema } from '../database/schema/ActivitiesSchema';
import { ArticleEntitySchema } from '../database/schema/ArticleSchema';
import { BasicPagesSchema } from '../database/schema/BasicPagesSchema';
import { ChildDevelopmentSchema } from '../database/schema/ChildDevelopmentSchema';
import { DailyHomeMessagesSchema } from '../database/schema/DailyHomeMessagesSchema';
import { HealthCheckUpsSchema } from '../database/schema/HealthCheckUpsSchema';
import { MilestonesSchema } from '../database/schema/MilestonesSchema';
import { PinnedChildDevelopmentSchema } from '../database/schema/PinnedChildDevelopmentSchema';
import { StandardDevHeightForAgeSchema } from '../database/schema/StandardDevHeightForAgeSchema';
import { StandardDevWeightForHeightSchema } from '../database/schema/StandardDevWeightForHeightSchema';
import { SurveysSchema } from '../database/schema/SurveysSchema';
import { TaxonomySchema } from '../database/schema/TaxonomySchema';
import { VaccinationSchema } from '../database/schema/VaccinationSchema';
import { VideoArticleEntitySchema } from '../database/schema/VideoArticleSchema';
import { setDownloadedBufferAgeBracket } from '../redux/reducers/childSlice';
import { setSponsorStore } from '../redux/reducers/localizationSlice';
import { setSyncDate } from '../redux/reducers/utilsSlice';
import { fetchAPI } from '../redux/sagaMiddleware/sagaActions';
import { receiveAPIFailure } from '../redux/sagaMiddleware/sagaSlice';
import { apiJsonDataGet, getAge } from '../services/childCRUD';
import { deleteArticleNotPinned } from '../services/commonApiService';

type ChildSetupNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChildSetup'
>;
const window = Dimensions.get('window');
type Props = {
  route:any;
  navigation: ChildSetupNavigationProp;
};


const LoadingScreen = ({route, navigation }: Props) => {
  //console.log(props,"..props..");
  const dispatch = useAppDispatch();
  // let apiJsonData  = route.params.apiJsonData;
  const child_age = useAppSelector(
    (state: any) =>
    state.utilsData.taxonomy.allTaxonomyData != '' ?JSON.parse(state.utilsData.taxonomy.allTaxonomyData).child_age:[],
  );
  const childList = useAppSelector(
    (state: any) => state.childData.childDataSet.allChild != '' ? JSON.parse(state.childData.childDataSet.allChild) : [],
  );
// const prevPage  = route.params.prevPage;
const {apiJsonData, prevPage, downloadWeeklyData, downloadMonthlyData, downloadBufferData, ageBrackets} = route.params;
  const sponsors = useAppSelector(
      (state: any) => state.selectedCountry.sponsors,
    );
  const languageCode = useAppSelector(
    (state: any) => state.selectedCountry.languageCode,
  );
  const activeChild = useAppSelector((state: any) =>
        state.childData.childDataSet.activeChild != ''
          ? JSON.parse(state.childData.childDataSet.activeChild)
          : [],
      );
      const bufferAgeBracket = useAppSelector((state: any) =>
      state.childData.childDataSet.bufferAgeBracket
    );
  const netInfoval = useNetInfoHook();
    useFocusEffect(
      React.useCallback(() => {
        console.log(netInfoval.isConnected,'--loading focuseffect--');
        if(netInfoval.isConnected != null)
        {
            callSagaApi();
        }
          return () => {
            // console.log("loading screen left");
          };
      },[netInfoval.isConnected])
    );
    useEffect(() => {
      const backAction = () => {
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );
    
      return () => {
        backHandler.remove();
      }
    }, []);
//console.log(apiJsonData,"..apiJsonData..");
  const callSagaApi = async () => {
    console.log('in callSagaApi ',netInfoval.isConnected);
    if(prevPage == "ChilSetup" || prevPage== "AddEditChild")
    {
      dispatch(fetchAPI(apiJsonData,prevPage,dispatch,navigation,languageCode,activeChild,apiJsonData,netInfoval.isConnected))
    }
    else if(prevPage == "Home")
    {
      dispatch(fetchAPI(apiJsonData,prevPage,dispatch,navigation,languageCode,activeChild,apiJsonData,netInfoval.isConnected))
    }
    else if(prevPage == "CountryLangChange" || prevPage == "DownloadUpdate")
    {
      const Ages=await getAge(childList,child_age);
      const newAges = [...new Set([...Ages,...bufferAgeBracket])]
      console.log(newAges,"..Ages..")
      let apiJsonDataarticle;
      if(newAges?.length>0){
        apiJsonDataarticle=apiJsonDataGet(String(newAges),"all")
      }
      else{
        apiJsonDataarticle=apiJsonDataGet("all","all")
      }
      apiJsonData.push(apiJsonDataarticle[0]);
      console.log(apiJsonData,"--apiJsonDataarticle---",apiJsonDataarticle);
      // dataRealmCommon.deleteAllAtOnce();
      var schemaarray = [ArticleEntitySchema,PinnedChildDevelopmentSchema,VideoArticleEntitySchema,DailyHomeMessagesSchema,
        BasicPagesSchema,TaxonomySchema,MilestonesSchema,ChildDevelopmentSchema,VaccinationSchema,HealthCheckUpsSchema,
        SurveysSchema,ActivitiesEntitySchema,StandardDevHeightForAgeSchema,StandardDevWeightForHeightSchema]
        const resolvedPromises =  schemaarray.map(async schema => {
          await dataRealmCommon.deleteOneByOne(schema);
        })
        const results = await Promise.all(resolvedPromises);
        console.log("delete done--",results);
      //dispatch(setSponsorStore({country_national_partner:null,country_sponsor_logo:null}));
      let payload = {errorArr:[],fromPage:'OnLoad'}
      dispatch(receiveAPIFailure(payload));
      const currentDate = DateTime.now().toMillis();
      dispatch(setSyncDate({key: 'weeklyDownloadDate', value: currentDate}));
      dispatch(setSyncDate({key: 'monthlyDownloadDate', value: currentDate}));
      console.log("called fetchapi after delete");
      dispatch(fetchAPI(apiJsonData,prevPage,dispatch,navigation,languageCode,activeChild,apiJsonData,netInfoval.isConnected))
    }
    else if(prevPage == "PeriodicSync")
    {
      let allAgeBrackets:any = [];
      console.log(downloadMonthlyData,"--downloadMonthlyData--",downloadWeeklyData,downloadBufferData);
      if(downloadBufferData == true)
      {
        if(ageBrackets?.length>0){
          console.log(ageBrackets,"..11Ages..");
          ageBrackets.map((ages:any)=>{
            allAgeBrackets.push(ages);
          })
        }
        // await dataRealmCommon.deleteOneByOne(ArticleEntitySchema);
        var schemaarray = [ArticleEntitySchema]
          const resolvedPromises =  schemaarray.map(async schema => {
            await dataRealmCommon.deleteOneByOne(schema);
          })
          const results = await Promise.all(resolvedPromises);
          console.log("delete downloadBufferData done--",results);
      }
      if(downloadWeeklyData == true)
      {
        const Ages=await getAge(childList,child_age);
        const newAges = [...new Set([...Ages,...bufferAgeBracket])]
        console.log(newAges,"..newAges..")
        if(newAges?.length>0){
          newAges.map((age:any)=>{
            allAgeBrackets.push(age);
          })
        }
        var schemaarray = [ArticleEntitySchema,PinnedChildDevelopmentSchema,VideoArticleEntitySchema,TaxonomySchema,
          ActivitiesEntitySchema]
          const resolvedPromises =  schemaarray.map(async schema => {
            await dataRealmCommon.deleteOneByOne(schema);
          })
          const results = await Promise.all(resolvedPromises);
          console.log("delete downloadWeeklyData done--",results);
        dispatch(setSyncDate({key: 'weeklyDownloadDate', value: DateTime.now().toMillis()}));
      }
      if(downloadMonthlyData == true)
      {
        var schemaarray = [DailyHomeMessagesSchema,BasicPagesSchema,MilestonesSchema,ChildDevelopmentSchema,
          VaccinationSchema,HealthCheckUpsSchema,StandardDevHeightForAgeSchema,StandardDevWeightForHeightSchema]
          const resolvedPromises =  schemaarray.map(async schema => {
            await dataRealmCommon.deleteOneByOne(schema);
          })
          const results = await Promise.all(resolvedPromises);
          console.log("delete downloadMonthlyData done--",results);
        dispatch(setSyncDate({key: 'monthlyDownloadDate', value: DateTime.now().toMillis()}));

      }
      allAgeBrackets = [...new Set(allAgeBrackets)];
      console.log(allAgeBrackets,"---in loading");
      let apiJsonDataarticle;
      if(allAgeBrackets.length > 0){
        apiJsonDataarticle=apiJsonDataGet(String(allAgeBrackets),"all")
      }else {
        apiJsonDataarticle=apiJsonDataGet("all","all")
      }
      apiJsonData.push(apiJsonDataarticle[0]);
      console.log(apiJsonData,"--apiJsonDataarticle---",apiJsonDataarticle);
      // dataRealmCommon.deleteAllAtOnce();
      // dispatch(setSponsorStore({country_national_partner:null,country_sponsor_logo:null}));
      // let payload = {errorArr:[],fromPage:'OnLoad'}
      // dispatch(receiveAPIFailure(payload));
      if(allAgeBrackets.length > 0) {
        // dispatch(setDownloadedBufferAgeBracket([]))
        dispatch(setDownloadedBufferAgeBracket(allAgeBrackets))
      }
      dispatch(fetchAPI(apiJsonData,prevPage,dispatch,navigation,languageCode,activeChild,apiJsonData,netInfoval.isConnected))
    }
    else if(prevPage == "ImportScreen")
    {
      const Ages=await getAge(childList,child_age);
      console.log(Ages,"..Ages..")
      let apiJsonDataarticle;
      if(Ages?.length>0){
        console.log(Ages,"..11Ages..")
        apiJsonDataarticle=apiJsonDataGet(String(Ages),"all")
      }
      else{
        apiJsonDataarticle=apiJsonDataGet("all","all")
      }
      console.log(apiJsonData,"--apiJsonDataarticle---",apiJsonDataarticle);
      // dataRealmCommon.deleteAllAtOnce();
      //Article delete fun if not pinned have to create with ArticleEntitySchema after cvariable success dispatch
      const deleteArticles=await deleteArticleNotPinned();
      console.log(deleteArticles,"..deleteArticles..");
      dispatch(setDownloadedBufferAgeBracket([]))
      dispatch(fetchAPI(apiJsonDataarticle,prevPage,dispatch,navigation,languageCode,activeChild,apiJsonDataarticle,netInfoval.isConnected))
    }
    else {
      dispatch(fetchAPI(apiJsonData,prevPage,dispatch,navigation,languageCode,activeChild,apiJsonData,netInfoval.isConnected))
    }
  }
  
  const themeContext = useContext(ThemeContext);
  const headerColor = themeContext.colors.SECONDARY_COLOR;
  return (
    <>
    <FocusAwareStatusBar animated={true} backgroundColor={headerColor} />
     <LoadingScreenComponent sponsors={sponsors}></LoadingScreenComponent>
   </>

  );
};

export default LoadingScreen;
