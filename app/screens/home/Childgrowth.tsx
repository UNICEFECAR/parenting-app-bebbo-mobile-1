import FocusAwareStatusBar from '@components/FocusAwareStatusBar';
import GrowthChart, { chartTypes } from '@components/growth/GrowthChart';
import GrowthInterpretation from '@components/growth/GrowthInterpretation';
import GrowthIntroductory from '@components/growth/GrowthIntroductory';
import LastChildMeasure from '@components/growth/LastChildMeasure';
import BabyNotification from '@components/homeScreen/BabyNotification';
import {
  ButtonContainer,
  ButtonPrimary,
  ButtonText
} from '@components/shared/ButtonGlobal';
import { BgContainer, MainContainer, SafeAreaContainer } from '@components/shared/Container';
import { FlexCol, FlexDirCol, FlexDirRow, FlexFDirRowSpace, FlexRow } from '@components/shared/FlexBoxStyle';
import Icon from '@components/shared/Icon';
import { TabBarContainer,TabBarContainerBrd, TabBarDefault } from '@components/shared/TabBarStyle';
import TabScreenHeader from '@components/TabScreenHeader';
import { HomeDrawerNavigatorStackParamList } from '@navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Heading2,
  Heading3,
  Heading3Centerr,
  Heading4,
  Heading4Center,
  ShiftFromBottom5,
  ShiftFromTop10,
  ShiftFromTopBottom10,
  ShiftFromTopBottom20,
  SideSpacing10
} from '@styles/typography';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, SafeAreaView, ScrollView,Text, View } from 'react-native';
import VectorImage from 'react-native-vector-image';
import { ThemeContext } from 'styled-components/native';
import { v4 as uuidv4 } from 'uuid';
import { useAppSelector } from '../../../App';
import { getCurrentChildAgeInMonths } from '../../services/childCRUD';
import { formatDaysData, formatHeightData } from '../../services/growthService';

type ChildgrowthNavigationProp =
  StackNavigationProp<HomeDrawerNavigatorStackParamList>;
type Props = {
  navigation: ChildgrowthNavigationProp;
  AddNewChildgrowth;
};
const Childgrowth = ({navigation}: Props) => {
  const {t} = useTranslation();
  const data = [
    {title: t('growthScreenweightForHeight')},
    {title: t('growthScreenheightForAge')},
  ];

  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const themeContext = useContext(ThemeContext);
  const headerColor = themeContext.colors.CHILDGROWTH_COLOR;
  const backgroundColor = themeContext.colors.CHILDGROWTH_TINTCOLOR;
  const headerColorWhite = themeContext.colors.SECONDARY_TEXTCOLOR;
  let activeChild = useAppSelector((state: any) =>
    state.childData.childDataSet.activeChild != ''
      ? JSON.parse(state.childData.childDataSet.activeChild)
      : [],
  );
  const standardDevData = useAppSelector((state: any) =>
    JSON.parse(state.utilsData.taxonomy.standardDevData),
  );
  // console.log(standardDevData,"statestandardDevData")
  const isFutureDate = (date: Date) => {
    return (
      new Date(date).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)
    );
  };
  const fullScreenChart = (chartType, obj, standardDeviation) => {
    // console.log((activeChild,chartType,obj,standardDeviation));
    navigation.navigate('ChartFullScreen', {
      activeChild,
      chartType,
      obj,
      standardDeviation,
    });
  };
  const renderItem = (item: typeof data[0], index: number) => {
    if (index == 0) {
      let obj;
      let standardDeviation;
      if (activeChild?.gender == '40' || activeChild?.gender == '') {
        //boy or no gender added
        // standardDeviation = require('../../assets/translations/appOfflineData/boystandardDeviation.json');
        const genderBoyData = standardDevData.filter(
          (item) => item.growth_type == 6461 && item.child_gender == 40,
        );
        standardDeviation = genderBoyData;
        obj = formatHeightData(genderBoyData);
      } else {
        //girl
        // standardDeviation = require('../../assets/translations/appOfflineData/girlstandardDeviation.json');
        const genderGirlData = standardDevData.filter(
          (item) => item.growth_type == 6461 && item.child_gender == 41,
        );
        standardDeviation = genderGirlData;
        obj = formatHeightData(genderGirlData);
      }
      return (
        <>
 <View	
          key={uuidv4()}	
            style={{	
              flexDirection: 'column',	
              
            }}>
<FlexCol>
            
            <ShiftFromTopBottom10>
              <FlexFDirRowSpace >
         
              <Heading2>{item.title}</Heading2>
              <Pressable
                onPress={() =>
                  fullScreenChart(
                    chartTypes.weightForHeight,
                    obj,
                    standardDeviation,
                  )
                }>
                <Icon name="ic_fullscreen" size={16} />
              </Pressable>
              </FlexFDirRowSpace>
            </ShiftFromTopBottom10>
            <GrowthChart
              activeChild={activeChild}
              chartType={chartTypes.weightForHeight}
              bgObj={obj}
              standardDeviation={standardDeviation}
            />
           
            <GrowthInterpretation
              activeChild={activeChild}
              chartType={chartTypes.weightForHeight}
              standardDeviation={standardDeviation}
              // getrelatedArticles={setrelatedArticles}
            />
            </FlexCol>
          </View>
          {/* 5 is growth category id */}
         
        </>
      );
    } else if (index == 1) {
      let obj;
      let standardDeviation;
      if (activeChild?.gender == '40' || activeChild?.gender == '') {
        // standardDeviation = require('../../assets/translations/appOfflineData/boystandardDeviation.json');
        const genderBoyData = standardDevData.filter(
          (item) => item.growth_type == 32786 && item.child_gender == 40,
        );
        standardDeviation = genderBoyData;
        // console.log(standardDeviation,"standardDeviation");
        obj = formatDaysData(genderBoyData);
      } else {
        // standardDeviation = require('../../assets/translations/appOfflineData/girlstandardDeviation.json');
        const genderGirlData = standardDevData.filter(
          (item) => item.growth_type == 32786 && item.child_gender == 41,
        );
        standardDeviation = genderGirlData;
        obj = formatDaysData(genderGirlData);
      }
      return (
        <>
        <View	
          key={uuidv4()}	
            style={{	
              flexDirection: 'column',	
              
            }}>
<FlexCol>
            
            <ShiftFromTopBottom10>
              <FlexFDirRowSpace >
              <Heading2>{item.title}</Heading2>
              <Pressable
                onPress={() =>
                  fullScreenChart(
                    chartTypes.heightForAge,
                    obj,
                    standardDeviation,
                  )
                }>
                <Icon name="ic_fullscreen" size={16} />
              </Pressable>
              </FlexFDirRowSpace>
            </ShiftFromTopBottom10>
            <GrowthChart
              activeChild={activeChild}
              chartType={chartTypes.heightForAge}
              bgObj={obj}
              standardDeviation={standardDeviation}
            />
            </FlexCol>
            <GrowthInterpretation
              activeChild={activeChild}
              chartType={chartTypes.heightForAge}
              standardDeviation={standardDeviation}
              // getrelatedArticles={setrelatedArticles}
            />
          </View>
          {/* 5 is growth category id */}
         

          {/*  */}
        </>
      );
    }
  };
  const renderDummyChart = () => {
    return (
      <>
        <View
          style={{
            backgroundColor: '#FFF',
            borderRadius: 4,
            alignItems: 'center',
            margin:15,
            padding: 15          }}>
          <VectorImage source={require('@assets/svg/chart.svg')}/>
        </View>
      </>
    );
  };
  return (
    <>
            <SafeAreaContainer>
        <FocusAwareStatusBar animated={true} backgroundColor={headerColor} />
        <FlexCol>

          <TabScreenHeader
            title={t('growthScreenheaderTitle')}
            headerColor={headerColor}
            textColor="#000"
          />
          <ScrollView
            style={{
              flex: 9,
              backgroundColor: backgroundColor,
              maxHeight: '100%',
            }}>
            <BabyNotification />
            {activeChild.measures.length == 0 ? (
              <>
                <FlexDirCol>
                  <ShiftFromBottom5>
                    <Heading3 style={{marginTop:15}}>
                      {t('babyNotificationbyAge', {
                        childName:
                          activeChild.childName != null &&
                          activeChild.childName != '' &&
                          activeChild.childName != undefined
                            ? activeChild.childName
                            : '',
                        ageInMonth:
                          activeChild.birthDate != null &&
                          activeChild.birthDate != '' &&
                          activeChild.birthDate != undefined
                            ? getCurrentChildAgeInMonths(
                                t,
                                activeChild.birthDate,
                              )
                            : '',
                      })}

                      {/* {t('growthScreengrowthDataTitle', {childAge: 3})} */}
                    </Heading3>
                  </ShiftFromBottom5>

                  {activeChild.measures.length == 0 ? (
                    <Heading3Centerr>
                      {t('growthScreennoGrowthData')}
                    </Heading3Centerr>
                  ) : null}
                  <ShiftFromTopBottom20>
                    <Heading4>{t('growthScreennoGrowthDataHelpText')}</Heading4>
                  </ShiftFromTopBottom20>
                </FlexDirCol>
                {renderDummyChart()}
              </>
            ) : (
              <MainContainer>
                
                <GrowthIntroductory activeChild={activeChild} />

                <LastChildMeasure activeChild={activeChild} />

                <>
                <BgContainer>
                  <TabBarContainerBrd
                    style={{
                      maxHeight: 50,
                    }}>
                    {data.map((item, itemindex) => {
                      return (
                        <Pressable
                          key={itemindex}
                          style={{flex: 1}}
                          onPress={() => {
                            setSelectedIndex(itemindex);
                          }}>
                          <TabBarDefault
                            style={[
                              {
                                backgroundColor:
                                  itemindex == selectedIndex
                                    ? headerColor
                                    : backgroundColor,
                              },
                            ]}>
                            <Heading4Center>{item.title}</Heading4Center>
                          </TabBarDefault>
                        </Pressable>
                      );
                    })}
                                    </TabBarContainerBrd>
                    

                  <SideSpacing10>
                    {renderItem(data[selectedIndex], selectedIndex)}
                    </SideSpacing10>
                    </BgContainer>
                </>
                
              
              </MainContainer>
            )}
          </ScrollView>

          <ButtonContainer style={{backgroundColor: backgroundColor}}>
            <ShiftFromTop10>
              <ButtonPrimary
                disabled={isFutureDate(activeChild?.birthDate)}
                style={{backgroundColor: headerColor}}
                onPress={() => {
                  navigation.navigate('AddNewChildgrowth', {
                    headerTitle: t('growthScreenaddNewBtntxt'),
                  });
                }}>
                <ButtonText>{t('growthScreenaddNewBtntxt')}</ButtonText>
              </ButtonPrimary>
            </ShiftFromTop10>
          </ButtonContainer>
        </FlexCol>
      </SafeAreaContainer>
    </>
  );
};

export default Childgrowth;
