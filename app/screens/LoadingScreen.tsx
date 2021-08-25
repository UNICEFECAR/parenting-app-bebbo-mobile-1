import FocusAwareStatusBar from '@components/FocusAwareStatusBar';
import { RootStackParamList } from '@navigation/types';
import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { Dimensions } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { useAppDispatch, useAppSelector } from '../../App';
import LoadingScreenComponent from '../components/LoadingScreenComponent';
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
import { setSponsorStore } from '../redux/reducers/localizationSlice';
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
  let apiJsonData  = route.params.apiJsonData;
  const child_age = useAppSelector(
    (state: any) =>
    state.utilsData.taxonomy.allTaxonomyData != '' ?JSON.parse(state.utilsData.taxonomy.allTaxonomyData).child_age:[],
  );
  const childList = useAppSelector(
    (state: any) => state.childData.childDataSet.allChild != '' ? JSON.parse(state.childData.childDataSet.allChild) : [],
  );
const prevPage  = route.params.prevPage;
  const sponsors = useAppSelector(
      (state: any) => state.selectedCountry.sponsors,
    );
    const netInfo=useNetInfo();
  const languageCode = useAppSelector(
    (state: any) => state.selectedCountry.languageCode,
  );
  const activeChild = useAppSelector((state: any) =>
        state.childData.childDataSet.activeChild != ''
          ? JSON.parse(state.childData.childDataSet.activeChild)
          : [],
      );
    useFocusEffect(
      React.useCallback(() => {
          callSagaApi();
          return () => {
            // console.log("loading screen left");
          };
      },[])
    );

//console.log(apiJsonData,"..apiJsonData..");
  const callSagaApi = async () => {
    if(prevPage == "ChilSetup" || prevPage== "AddEditChild")
    {
      dispatch(fetchAPI(apiJsonData,prevPage,dispatch,navigation,languageCode,activeChild,apiJsonData))
    }
    else if(prevPage == "Home")
    {
      dispatch(fetchAPI(apiJsonData,prevPage,dispatch,navigation,languageCode,activeChild,apiJsonData))
    }
    else if(prevPage == "CountryLangChange")
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
      apiJsonData.push(apiJsonDataarticle[0]);
      console.log(apiJsonData,"--apiJsonDataarticle---",apiJsonDataarticle);
      // dataRealmCommon.deleteAllAtOnce();
      dataRealmCommon.deleteOneByOne(ArticleEntitySchema);
      dataRealmCommon.deleteOneByOne(PinnedChildDevelopmentSchema);
      dataRealmCommon.deleteOneByOne(VideoArticleEntitySchema);
      dataRealmCommon.deleteOneByOne(DailyHomeMessagesSchema);
      dataRealmCommon.deleteOneByOne(BasicPagesSchema);
      dataRealmCommon.deleteOneByOne(TaxonomySchema);
      dataRealmCommon.deleteOneByOne(MilestonesSchema);
      dataRealmCommon.deleteOneByOne(ChildDevelopmentSchema);
      dataRealmCommon.deleteOneByOne(VaccinationSchema);
      dataRealmCommon.deleteOneByOne(HealthCheckUpsSchema);
      dataRealmCommon.deleteOneByOne(SurveysSchema);
      dataRealmCommon.deleteOneByOne(ActivitiesEntitySchema);
      dataRealmCommon.deleteOneByOne(StandardDevHeightForAgeSchema);
      dataRealmCommon.deleteOneByOne(StandardDevWeightForHeightSchema);
      dispatch(setSponsorStore({country_national_partner:null,country_sponsor_logo:null}));
      let payload = {errorArr:[],fromPage:'OnLoad'}
      dispatch(receiveAPIFailure(payload));
      dispatch(fetchAPI(apiJsonData,prevPage,dispatch,navigation,languageCode,activeChild,apiJsonData))
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
      const deletArticles=await deleteArticleNotPinned();
      dispatch(fetchAPI(apiJsonDataarticle,prevPage,dispatch,navigation,languageCode,activeChild,apiJsonDataarticle))
    }
    else {
      dispatch(fetchAPI(apiJsonData,prevPage,dispatch,navigation,languageCode,activeChild,apiJsonData))
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
