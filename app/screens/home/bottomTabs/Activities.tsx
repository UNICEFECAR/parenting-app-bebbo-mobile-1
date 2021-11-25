import { destinationFolder } from '@assets/translations/appOfflineData/apiConstants';
import ActivitiesCategories from '@components/ActivitiesCategories';
import AgeBrackets from '@components/AgeBrackets';
import FocusAwareStatusBar from '@components/FocusAwareStatusBar';
import { ActivityBox, ArticleHeading, ArticleListContainer, ArticleListContent } from '@components/shared/ArticlesStyle';
import { ButtonTextSmLine } from '@components/shared/ButtonGlobal';
import RNFS from 'react-native-fs';
import { MainContainer } from '@components/shared/Container';
import { DividerAct } from '@components/shared/Divider';
import FirstTimeModal from '@components/shared/FirstTimeModal';
import { FDirCol, FDirRow, Flex2, Flex4, FlexCol, FlexDirRow, FlexDirRowSpace } from '@components/shared/FlexBoxStyle';
import PrematureTag, { PrematureTagActivity } from '@components/shared/PrematureTag';
import ShareFavButtons from '@components/shared/ShareFavButtons';
import TabScreenHeader from '@components/TabScreenHeader';
import { HomeDrawerNavigatorStackParamList } from '@navigation/types';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Heading3, Heading4, Heading4Center, Heading4Centerr, Heading5Bold, Heading6Bold, ShiftFromTop5, ShiftFromTopBottom5 } from '@styles/typography';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet, Text, View
} from 'react-native';
import styled, { ThemeContext } from 'styled-components/native';
import { useAppDispatch, useAppSelector } from '../../../../App';
import { setInfoModalOpened } from '../../../redux/reducers/utilsSlice';
import LoadableImage from '../../../services/LoadableImage';

import analytics from '@react-native-firebase/analytics';
import { GAME_AGEGROUP_SELECTED } from '@assets/data/firebaseEvents';
import OverlayLoadingComponent from '@components/OverlayLoadingComponent';
import Icon from '@components/shared/Icon';
import ModalPopupContainer, { PopupOverlay, PopupCloseContainer, PopupClose, ModalPopupContent } from '@components/shared/ModalPopupStyle';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userRealmCommon } from '../../../database/dbquery/userRealmCommon';
import { ChildEntity, ChildEntitySchema } from '../../../database/schema/ChildDataSchema';
type ActivitiesNavigationProp =
  StackNavigationProp<HomeDrawerNavigatorStackParamList>;
type Props = {
  route: any
  navigation: ActivitiesNavigationProp;
};
// const ContainerView = styled.SafeAreaView`
//   flex: 1;
//   background-color: ${(props) => props.theme.colors.ACTIVITIES_TINTCOLOR};
// `;

const Activities = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const flatListRef = React.useRef();
  let sectionListRef:any;
  const themeContext = useContext(ThemeContext);
  const headerColor = themeContext.colors.ACTIVITIES_COLOR;
  const backgroundColor = themeContext.colors.ACTIVITIES_TINTCOLOR;
  const headerColorBlack = themeContext.colors.PRIMARY_TEXTCOLOR;
  const fromPage = 'Activities';
  const childAge = useAppSelector(
    (state: any) =>
      state.utilsData.taxonomy.allTaxonomyData != '' ? JSON.parse(state.utilsData.taxonomy.allTaxonomyData).child_age : [],
  );
  const toggleSwitchVal = useAppSelector((state: any) =>
  state.bandWidthData?.lowbandWidth
    ? state.bandWidthData.lowbandWidth
    : false,
);
  const activeChild = useAppSelector((state: any) =>
    state.childData.childDataSet.activeChild != ''
      ? JSON.parse(state.childData.childDataSet.activeChild)
      : [],
  );
  const languageCode = useAppSelector(
    (state: any) => state.selectedCountry.languageCode,
  );
  const ActivitiesData = useAppSelector(
    (state: any) =>
      state.utilsData.ActivitiesData != '' ? JSON.parse(state.utilsData.ActivitiesData) : [],
  );
  const activityCategoryData = useAppSelector(
    (state: any) =>
      JSON.parse(state.utilsData.taxonomy.allTaxonomyData).activity_category,
  );
  const MileStonesData = useAppSelector(
    (state: any) =>
      state.utilsData.MileStonesData != '' ? JSON.parse(state.utilsData.MileStonesData) : [],
  );
  const favoritegames = useAppSelector((state: any) =>
    state.childData.childDataSet.favoritegames
  );
  const renderIndicator = (progress: any, indeterminate: any) => (<Text>{indeterminate ? 'Loading..' : progress * 100}</Text>);
  const activityModalOpened = useAppSelector((state: any) =>
    (state.utilsData.IsActivityModalOpened),
  );
  const modalScreenKey = 'IsActivityModalOpened';
  const modalScreenText = 'activityModalText';
  const [modalVisible, setModalVisible] = useState(false);
  const [isImgLoaded, setIsImageLoaded] = useState(false);
  const [filterArray, setFilterArray] = useState([]);
  const [currentSelectedChildId, setCurrentSelectedChildId] = useState(0);
  const [selectedChildActivitiesData, setSelectedChildActivitiesData] = useState([]);
  const [suggestedGames, setsuggestedGames] = useState([]);
  const [otherGames, setotherGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setfilteredData] = useState([]);
  const [showNoData, setshowNoData] = useState(false);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [childMilestonedata,setchildMilestonedata] = useState([]);
  const setIsModalOpened = async (varkey: any) => {
    if (modalVisible == true) {
      let obj = { key: varkey, value: false };
      dispatch(setInfoModalOpened(obj));
      setModalVisible(false);
    }
  };
  useFocusEffect(() => {
   // console.log("in activity focuseffect without callback", activityModalOpened);
    setModalVisible(activityModalOpened);
  })

  const toTop = () => {
    // use current
    // flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 })
    if(sectionListRef){
    sectionListRef.scrollToLocation(
      {
        animated:Platform.OS=="android" ? true:false,
        sectionIndex: 0,
        itemIndex: 0
      }
    );
    }
  }
  useFocusEffect(
    React.useCallback(() => {
      // console.log("useFocusEffect called");
      setLoading(true);
      // setModalVisible(true);
    //  console.log("in usefocuseffect 2", route.params);
      async function fetchData() {
        if (route.params?.categoryArray) {
          // console.log(route.params?.categoryArray);
          setFilterArray(route.params?.categoryArray);
          setFilteredActivityData(route.params?.categoryArray);
        }
        else {
          setFilterArray([]);
          setFilteredActivityData([]);
        }
      }
      if (route.params?.backClicked != 'yes') {
        fetchData()
      } else {
        setLoading(false);
      }

    }, [selectedChildActivitiesData, route.params?.categoryArray])
  );

  const showSelectedBracketData = (item: any) => {
   // console.log("in showSelectedBracketData--", item);

    analytics().logEvent(GAME_AGEGROUP_SELECTED, { age_id: item.id });
    // if(route.params?.backClicked == 'yes')
    // {
    //   navigation.setParams({backClicked:'no'})
    // }
    setCurrentSelectedChildId(item.id);
    let filteredData = ActivitiesData.filter((x: any) => x.child_age.includes(item.id));
    // filteredData =filteredData.map( item => ({ ...item, name:item.name }) )
   // console.log("filteredData---", filteredData);
    setSelectedChildActivitiesData(filteredData);
    // console.log(filteredData?.length);
    // if(filteredData?.length>0){
    //   filteredData.map(async (item: any, index: number) => {
    //     if (item['cover_image'] != "" && item['cover_image'] != null && item['cover_image'] != undefined && item['cover_image'].url != "" && item['cover_image'].url != null && item['cover_image'].url != undefined) {
    //       if (await RNFS.exists(destinationFolder + '/' + item['cover_image']?.url.split('/').pop())) {
    //       }
    //       else{
    //       let imageArray:any=[];
    //       imageArray.push({
    //           srcUrl: item['cover_image'].url, 
    //           destFolder: destinationFolder, 
    //           destFilename: item['cover_image'].url.split('/').pop()
    //       })
    //       const imagesDownloadResult = await downloadImages(imageArray);
    //       console.log(imagesDownloadResult,"..imagesDownloadResult..");
    //     }
    //     }
    //     });
    //     // console.log(imageArray,"..imageArray..");

    // }
  }
  useFocusEffect(
    React.useCallback(() => {
      // console.log("child dev usefocuseffect");
    //  console.log("in usefocuseffect 1", route.params);
      if (route.params?.backClicked != 'yes') {
        setshowNoData(false);
        if (route.params?.currentSelectedChildId && route.params?.currentSelectedChildId != 0) {
          // console.log(route.params?.categoryArray);
          const firstChildDevData = childAge.filter((x: any) => x.id == route.params?.currentSelectedChildId);
          // console.log("firstChildDevData---",firstChildDevData);
          showSelectedBracketData(firstChildDevData[0]);
        }
        else {
          if(activeChild?.taxonomyData.prematureTaxonomyId!=null && activeChild?.taxonomyData.prematureTaxonomyId!=undefined && activeChild?.taxonomyData.prematureTaxonomyId!=""){
            const firstChildDevData = childAge.filter((x: any) => x.id == activeChild?.taxonomyData.prematureTaxonomyId);
            // console.log("firstChildDevData---", firstChildDevData);
             showSelectedBracketData(firstChildDevData[0]);
          }
          else{
          const firstChildDevData = childAge.filter((x: any) => x.id == activeChild?.taxonomyData.id);
         // console.log("firstChildDevData---", firstChildDevData);
          showSelectedBracketData(firstChildDevData[0]);
          }
        }
      } else {
        setLoading(false);
        if (route.params?.backClicked == 'yes') {
          navigation.setParams({ backClicked: 'no' })
        }
      }

    }, [activeChild?.uuid, languageCode, route.params?.currentSelectedChildId])
  );
  useFocusEffect(
    React.useCallback(() => {
     // console.log("in usefocuseffect with unmount23");
      const fetchData = async () => {
        const filterQuery = 'uuid == "'+activeChild?.uuid+'"';
        const childData = await userRealmCommon.getFilteredData<ChildEntity>(ChildEntitySchema, filterQuery);
        setchildMilestonedata(childData[0].checkedMilestones)
      }
      fetchData()
      return () => {
        // setModalVisible(false);
        // setFilterArray([]);
        // setCurrentSelectedChildId(0);
        // setSelectedChildActivitiesData([]);
        // setsuggestedGames([]);
        // setotherGames([]);
        // setLoading(false);
        // setfilteredData([]);
        // setshowNoData(false);
      //  console.log("in unmount-", route.params?.currentSelectedChildId);
        navigation.setParams({ backClicked: 'no' })
        // if(route.params?.currentSelectedChildId)
        // {
        navigation.setParams({ currentSelectedChildId: 0 })
        // route.params?.currentSelectedChildId = 0;
        // }
        // if(route.params?.categoryArray)
        // {
        navigation.setParams({ categoryArray: [] })
        // route.params?.currentSelectedChildId = 0;
        // }
      };
    }, [])
  );
  useFocusEffect(
    React.useCallback(() => {
      console.log(activeChild,"..activeChild..")
      // console.log("child dev usefocuseffect");
      // || (x.related_milestone.length > 0 && (childMilestonedata.findIndex((y:any)=>y == x.related_milestone[0])) > -1)
      setsuggestedGames(filteredData.filter((x: any) => x.related_milestone.length > 0 && ((childMilestonedata.findIndex((y:any)=>y == x.related_milestone[0])) == -1)));
      setotherGames(filteredData.filter((x: any) => x.related_milestone.length == 0  || (x.related_milestone.length > 0 && (childMilestonedata.findIndex((y:any)=>y == x.related_milestone[0])) > -1)));
      //console.log("filteredData inner---", filteredData);
    }, [filteredData,childMilestonedata])
  );
  const setFilteredActivityData = (itemId: any) => {
   // console.log(itemId, "articleData in filtered ", selectedChildActivitiesData);
    // if(route.params?.backClicked == 'yes')
    // {
    //   navigation.setParams({backClicked:'no'})
    // }
    if (selectedChildActivitiesData && selectedChildActivitiesData.length > 0 && selectedChildActivitiesData != []) {
     // console.log("in if");
      if (itemId.length > 0) {
        const newArticleData = selectedChildActivitiesData.filter((x: any) => itemId.includes(x.activity_category));
        setfilteredData(newArticleData);
        setLoading(false);
        setTimeout(() => {
          setshowNoData(true);
        }, 200);
      } else {
        const newArticleData = selectedChildActivitiesData.length > 0 ? selectedChildActivitiesData : [];
        setfilteredData(newArticleData);
        setLoading(false);
        setTimeout(() => {
          setshowNoData(true);
        }, 200);
      }
    }
    else {
      setfilteredData([]);
      setLoading(false);
      setTimeout(() => {
        setshowNoData(true);
      }, 200);
    }
    toTop();
  }
  const goToActivityDetail = (item: typeof filteredData[0]) => {
   // console.log(selectedChildActivitiesData, "--selectedChildActivitiesData");
    navigation.navigate('DetailsScreen',
      {
        fromScreen: "Activities",
        headerColor: headerColor,
        backgroundColor: backgroundColor,
        detailData: item,
        listCategoryArray: filterArray,
        selectedChildActivitiesData: selectedChildActivitiesData,
        currentSelectedChildId: currentSelectedChildId
      });
  };
  //console.log(filteredData.length,"--filteredData");
  //console.log(suggestedGames.length,"--suggestedGames");
  //console.log(otherGames.length,"--otherGames");

  const onFilterArrayChange = (newFilterArray: any) => {
    //console.log("on filterarray change", newFilterArray);
    // filterArray = [...newFilterArray];
    setFilterArray(newFilterArray)
    // console.log("on filterarray change after",filterArray)
  }
  const gotoMilestone = () => {
    //console.log("currentSelectedChildId---",currentSelectedChildId)
    navigation.navigate('ChildDevelopment',
    {
      currentSelectedChildId: currentSelectedChildId
    });
  }
  const SuggestedActivities = React.memo(({ item, section, index }) => {
    //console.log(section, "SuggestedActivities", item.id);
    let milestonedatadetail:any = [];
    if(section == 1) {
      const relatedmilestoneid = item.related_milestone.length > 0 ? item.related_milestone[0] : 0;
      milestonedatadetail = MileStonesData.filter((x:any)=>x.id == relatedmilestoneid);
    }
    return (
        <ArticleListContainer>
           <Pressable onPress={() => { goToActivityDetail(item) }} key={index}>
          <LoadableImage style={styles.cardImage} item={item} toggleSwitchVal={toggleSwitchVal}/>
          <ArticleListContent>
            <ShiftFromTopBottom5>
              <Heading6Bold>{activityCategoryData.filter((x: any) => x.id == item.activity_category)[0].name}</Heading6Bold>
            </ShiftFromTopBottom5>
            <Heading3>{item.title}</Heading3>
            {/* keep below code ActivityBox for future use */}
            {section == 1 && milestonedatadetail.length > 0 && ((childMilestonedata.findIndex((x:any)=>x == milestonedatadetail[0]?.id)) == -1) ? 
            <ActivityBox>
            <Flex4>
              <Heading6Bold>
                {t('actScreenpendingMilestone')} {t('actScreenmilestones')}
              </Heading6Bold>
              <ShiftFromTop5>
              <Heading4>{milestonedatadetail[0]?.title}</Heading4>
              </ShiftFromTop5>
            </Flex4>
            <Flex2>
              <Pressable onPress={() => gotoMilestone()} style={{paddingTop:15,paddingBottom:15}}>
                <ButtonTextSmLine numberOfLines={2}>
                  {t('actScreentrack')} {t('actScreenmilestones')}
                </ButtonTextSmLine>
              </Pressable>
              </Flex2>
          </ActivityBox>
        : null
        }
          </ArticleListContent>
          <ShareFavButtons backgroundColor={'#FFF'} item={item} isFavourite = {((favoritegames.findIndex((x:any)=>x == item?.id)) > -1) ? true : false} isAdvice={false} />
          </Pressable>
        </ArticleListContainer>
     
    )
  });

  const DATA = [
    {
      id: 1,
      title: t('actScreensugacttxt'),
      data: suggestedGames
    },
    {
      id: 2,
      title: t('actScreenotheracttxt'),
      data: otherGames
    }
  ];
  
  const HeadingComponent = React.memo(({ section }) => {
    return (
      <ArticleHeading>
        <FlexDirRowSpace>
          <Heading3>{section.title}</Heading3>
          {section?.id == 1 && activeChild.isPremature === 'true' ? (
            <Pressable onPress={() => setModalVisible1(true)}>
              <PrematureTagActivity>
                <Heading5Bold>{t('actScreenprematureText')}</Heading5Bold>
              </PrematureTagActivity>
            </Pressable>
          ) : null}
        </FlexDirRowSpace>
      </ArticleHeading>
    )
  });

  return (
    <>
      <OverlayLoadingComponent loading={loading} />
      <View style={{flex:1,backgroundColor:backgroundColor}}>
        <FocusAwareStatusBar animated={true} backgroundColor={headerColor} />
        {/* <ScrollView nestedScrollEnabled={true}> */}
        <TabScreenHeader
          title={t('actScreenheaderTitle')}
          headerColor={headerColor}
          textColor="#000"
        />
        <FlexCol>
          <View style={{ backgroundColor: '#fff' }}>
            {/* {currentSelectedChildId && currentSelectedChildId != 0 ? */}
            <AgeBrackets
              itemColor={headerColorBlack}
              activatedItemColor={headerColor}
              currentSelectedChildId={currentSelectedChildId}
              showSelectedBracketData={showSelectedBracketData}
              ItemTintColor={backgroundColor}
            />
            {/* : null} */}
          </View>

          <DividerAct></DividerAct>
          <ActivitiesCategories
            borderColor={headerColor}
            filterOnCategory={setFilteredActivityData}
            fromPage={fromPage}
            filterArray={filterArray}
            onFilterArrayChange={onFilterArrayChange}
          />
          <DividerAct></DividerAct>

          <FlexCol>
            {showNoData == true && suggestedGames?.length == 0 && otherGames?.length == 0 ?
              <Heading4Center>{t('noDataTxt')}</Heading4Center>
              : null}
            {/* <FlatList
                  ref={flatListRef}
                  data={otherGames}
                  removeClippedSubviews={true} // Unmount components when outside of window 
                  initialNumToRender={4} // Reduce initial render amount
                  maxToRenderPerBatch={4} // Reduce number in each render batch
                  updateCellsBatchingPeriod={100} // Increase time between renders
                  windowSize={7} // Reduce the window size
                  // renderItem={({ item, index }) => renderActivityItem(item, index)}
                  renderItem={({item, index}) => <RenderActivityItem item={item} index={index} />  }
                  keyExtractor={(item) => item.id.toString()}
                  ListHeaderComponent={ContentThatGoesAboveTheFlatList}
                // ListFooterComponent={ContentThatGoesBelowTheFlatList}
                /> */}
            <SectionList
              sections={DATA}
              // ref={flatListRef}
              ref={ref => (sectionListRef = ref)}
              keyExtractor={(item, index) => String(item?.id) + String(index)}
              stickySectionHeadersEnabled={false}
              // initialNumToRender={4}
              // renderItem={({ item, title }) => <Item item={item} title={title}/>}
              removeClippedSubviews={true} // Unmount components when outside of window 
              initialNumToRender={4} // Reduce initial render amount
              maxToRenderPerBatch={4} // Reduce number in each render batch
              updateCellsBatchingPeriod={100} // Increase time between renders
              windowSize={7} // Reduce the window size
              renderItem={({ item, section, index }) => <SuggestedActivities item={item} section={section.id} index={index} />}
              // renderItem={({ section, item }) => renderItem(section.id, item) }
              renderSectionHeader={({ section }) => (
                section.data.length > 0 ?
                  <HeadingComponent section={section} />
                  // <Text style={styles.header}>{section.title}</Text> 
                  : null
              )}
            />

          </FlexCol>
        </FlexCol>
        <FirstTimeModal modalVisible={modalVisible} setIsModalOpened={setIsModalOpened} modalScreenKey={modalScreenKey} modalScreenText={modalScreenText}></FirstTimeModal>
        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible1}
          onRequestClose={() => {
            // Alert.alert('Modal has been closed.');
            setModalVisible1(false);
          }}
          onDismiss={() => {
            setModalVisible1(false);
          }}>
          <PopupOverlay>
            <ModalPopupContainer>
              <PopupCloseContainer>
                <PopupClose
                  onPress={() => {
                    setModalVisible1(false);
                  }}>
                  <Icon name="ic_close" size={16} color="#000" />
                </PopupClose>
              </PopupCloseContainer>
              <ModalPopupContent>
                <Heading4Centerr>
                  {t('childSetupprematureMessage')}
                </Heading4Centerr>
              </ModalPopupContent>
            </ModalPopupContainer>
          </PopupOverlay>
        </Modal>
      </View>
    </>
  );
};

export default Activities;

const styles = StyleSheet.create({
  cardImage: {
    height: 200,
    width: '100%',
    flex: 1,
    alignSelf: 'center',
  },
});
