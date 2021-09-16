import Icon from '@components/shared/Icon';
import { useNavigation } from '@react-navigation/native';
import { Heading4Bold, Heading4Regular, Heading5Bold, Heading6, ShiftFromTop10, ShiftFromTop5 } from '@styles/typography';
import { DateTime } from 'luxon';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers
} from 'react-native-popup-menu';
import { ThemeContext } from 'styled-components/native';
import { useAppSelector } from '../../App';
import { getCurrentChildAgeInMonths } from '../services/childCRUD';
import { formatStringDate, formatStringTime } from '../services/Utils';
import { ButtonTextSmLineL } from './shared/ButtonGlobal';
import Checkbox, { CheckboxActive, CheckboxItem } from './shared/CheckboxStyle';
import { FormOuterCheckbox } from './shared/ChildSetupStyle';
import Divider, { DividerContainer } from './shared/Divider';
import { FlexDirRowStart } from './shared/FlexBoxStyle';
import { NotifAction, NotificationListContainer, NotifIcon, NotifiContent } from './shared/NotificationStyle';


const NotificationItem = (props: any) => {
  const { item, itemIndex, onItemReadMarked, onItemDeleteMarked, isDeleteEnabled, childAgeInDays, activeChild } = props;
  const themeContext = useContext(ThemeContext);
  console.log(childAgeInDays, "childAgeInDays")
  const hcheaderColor = themeContext.colors.HEALTHCHECKUP_COLOR;
  const navigation = useNavigation();
  // const primaryColor = themeContext.colors.PRIMARY_COLOR;
  const primaryTintColor = themeContext.colors.PRIMARY_TINTCOLOR;
  const luxonLocale = useAppSelector(
    (state: any) => state.selectedCountry.luxonLocale,
  );
  const geticonname = (type: string) => {
    // console.log(type)
    return type == 'gw'
      ? 'ic_growth'
      : type == 'cd'
        ? 'ic_milestone'
        : type == 'vc' || type == 'vcr'
          ? 'ic_vaccination'
          : type == 'hc' || type == 'hcr'
            ? 'ic_doctor_chk_up'
            : 'ic_growth';
  };
  const getButtonname = (type: string) => {
    return type == 'gw'
      ? t('growthScreenaddNewBtntxt')
      : type == 'cd'
        ? t('trackMilestoneViewBtn')
        : type == 'vc' || type == 'vcr'
          ? t('vcAddBtn')
          : type == 'hc'
            ? t('hcReminderbtn')
            : type == 'hcr' ? t('hcNewBtn') : '';
  };
  const gotoPage = (type: string) => {
    //console.log(type);
    type == 'gw'
      ? navigation.navigate('AddNewChildgrowth', {
        headerTitle: t('growthScreenaddNewBtntxt'),
      })
      : type == 'cd'
        ? navigation.navigate('Home', { screen: 'ChildDevelopment' })
        : type == 'vc' || type == 'vcr'
          ? navigation.navigate('Home', {
            screen: 'Tools',
            params: {
              screen: 'VaccinationTab',
            },
          })
          : type == 'hc'
            ? navigation.navigate('AddReminder', {
              reminderType: 'healthCheckup', // from remiderType
              headerTitle: t('vcReminderHeading'),
              buttonTitle: t('hcReminderAddBtn'),
              titleTxt: t('hcReminderText'),
              warningTxt: t('hcReminderDeleteWarning'),
              headerColor: hcheaderColor,
            })
            : type == 'hcr'
              ? navigation.navigate('Home', {
                screen: 'Tools',
                params: {
                  screen: 'HealthCheckupsTab',
                },
              }) : '';
  };
  const markAsRead = (item: any) => {
    onItemReadMarked(item);
  }
  const markAsDelete = (item: any) => {
    onItemDeleteMarked(item);
  }
  const growthColor = themeContext.colors.CHILDGROWTH_COLOR;
  const vaccinationColor = themeContext.colors.VACCINATION_COLOR;
  const hkColor = themeContext.colors.HEALTHCHECKUP_COLOR;
  const cdColor = themeContext.colors.CHILDDEVELOPMENT_COLOR;
  const { t } = useTranslation();
  const [toggleCheckBox, setToggleCheckBox] = useState(item.isChecked);
  useEffect(() => {
    setToggleCheckBox(false);
  }, [isDeleteEnabled])
  // const IsGrowthMeasuresForPeriodExist = () => {
  //   // isGrowthMeasureExistForDate(selectedMeasureDate,activeChild)
  //   // if item.days_to is today's date and thne check measures not entered then only show
  //   let isGrowthNotMeasureExist = true;
  //   if (activeChild.measures.length > 0) {
  //     activeChild.measures.forEach((measure) => {
  //       const childMeasureDateInDays = getCurrentChildAgeInDays(
  //         DateTime.fromJSDate(new Date(measure.measurementDate)).toMillis(),
  //       );
  //       if (item.days_from < childMeasureDateInDays && item.days_to > childMeasureDateInDays) {
  //         isGrowthNotMeasureExist = false;
  //       } else {
  //         isGrowthNotMeasureExist = true;
  //       }
  //       //get measurementdate in days and check if it is in between
  //       //find if measure exists in day_from and day_to
  //     })
  //   }
  //   // console.log(isGrowthNotMeasureExist, 'isGrowthMeasureExist')
  //   return isGrowthNotMeasureExist
  // }
  const renderGrowthNotifcation = () => {
    // console.log(IsGrowthMeasuresForPeriodExist(), "renderGrowthNotifcation");
    // childcreate date
    // let fromDate = DateTime.fromJSDate(new Date(activeChild.birthDate)).plus({ days: item.days_from });
    let toDay = DateTime.fromJSDate(new Date());
    let childCrateDate = DateTime.fromJSDate(new Date(activeChild.createdAt));
    // Alert.alert(fromDate + "fromDate")
    // Alert.alert(childCrateDate + "childCrateDate");
    // console.log(childCrateDate, "childCrateDate")
    return (
      //
      (toDay >= item.notificationDate && childCrateDate <= item.notificationDate) ? item.isDeleted ? null :
        //if childageInDays is between days_from and days_to then only display notis which have days_from == chilAgeInDays
        (<>
          <NotificationListContainer>
            <FlexDirRowStart>
              <NotifIcon style={{
                backgroundColor: growthColor
              }}>

                <Icon
                  name={geticonname(item.type)}
                  size={20}
                  color="#000"

                />
              </NotifIcon>
              <NotifiContent>
                {item.isRead == true ?
                  <Heading4Regular>{t(item.title, { periodName: item.periodName })}</Heading4Regular> :
                  <Heading4Bold>{t(item.title, { periodName: item.periodName })}</Heading4Bold>
                }


                <ShiftFromTop5>
                  <Heading6>  {formatStringDate(item.notificationDate, luxonLocale)}</Heading6>
                  <Heading6>{
                    getCurrentChildAgeInMonths(
                      t,
                      DateTime.fromJSDate(new Date(item.notificationDate))
                    )}</Heading6>
                  {/* <Heading6>{item.days_from},{item.days_to},{String(item.growth_period)}</Heading6> */}
                </ShiftFromTop5>
                <ShiftFromTop10>
                  <Pressable onPress={() => gotoPage(item.type)}>
                    <ButtonTextSmLineL numberOfLines={2}>{getButtonname(item.type)}</ButtonTextSmLineL>
                  </Pressable></ShiftFromTop10>
              </NotifiContent>

              <NotifAction>
                {(isDeleteEnabled === true) ? (
                  <FormOuterCheckbox
                    onPress={() => {
                      //  console.log(item);
                      setToggleCheckBox(!toggleCheckBox);
                      props.onItemChecked(item, !toggleCheckBox)
                    }}>
                    <CheckboxItem>
                      <View>
                        {toggleCheckBox ? (
                          <CheckboxActive>
                            <Icon name="ic_tick" size={12} color="#000" />
                          </CheckboxActive>
                        ) : (
                          <Checkbox style={{ borderWidth: 1 }}></Checkbox>
                        )}
                      </View>
                    </CheckboxItem>
                  </FormOuterCheckbox>
                ) : (
                  <>
                    <Menu
                      renderer={renderers.ContextMenu}
                      style={{
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onSelect={(value) =>
                        console.log(`Selected number: ${value} ${item}`)
                      }>
                      <MenuTrigger>
                        <Icon
                          style={{
                            flex: 1,
                            textAlign: 'right',
                            alignSelf: 'center',
                          }}
                          name={'ic_kebabmenu'}
                          size={25}
                          color="#000"
                        />
                      </MenuTrigger>
                      <MenuOptions
                        customStyles={{
                          optionsContainer: {
                            marginTop: 30,
                            borderRadius: 10,
                            backgroundColor: primaryTintColor,
                          },

                          optionWrapper: {
                            borderBottomWidth: 1,
                            padding: 15,
                          },

                        }}>
                        <MenuOption value={1} onSelect={() => markAsDelete(item)}>
                          <Heading5Bold>{t('notiOption1')}</Heading5Bold>
                        </MenuOption>
                        <MenuOption value={2} onSelect={() => markAsRead(item)}>
                          <Heading5Bold> {item.isRead == true ? t('notiOption3') : t('notiOption2')}</Heading5Bold>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  </>
                )}
              </NotifAction>

            </FlexDirRowStart>

          </NotificationListContainer>
          <DividerContainer><Divider></Divider></DividerContainer>
        </>) : null)
  }
  const renderHCNotifcation = () => {
    //At the beginning of the period

    let toDay = DateTime.fromJSDate(new Date());
    let childCrateDate = DateTime.fromJSDate(new Date(activeChild.createdAt));
    // Alert.alert(fromDate + "fromDate")
    // Alert.alert(childCrateDate + "childCrateDate");
    // console.log(childCrateDate, "childCrateDate")
    return (
      (toDay >= item.notificationDate && childCrateDate <= item.notificationDate) ? (item.isDeleted ? null :


        // let fromDate = DateTime.fromJSDate(new Date(activeChild.birthDate)).plus({ days: item.days_from });
        // let childCrateDate = DateTime.fromJSDate(new Date(activeChild.createdAt));
        // return (item.days_from < childAgeInDays && childCrateDate <= fromDate) ? (item.isDeleted ? null : 
        <>
          <NotificationListContainer>
            <FlexDirRowStart>
              <NotifIcon style={{
                backgroundColor: hkColor
              }}>

                <Icon
                  name={geticonname(item.type)}
                  size={20}
                  color="#000"

                />
              </NotifIcon>
              <NotifiContent>
                {item.isRead == true ?
                  <Heading4Regular>{t(item.title, { periodName: item.periodName })}</Heading4Regular> :
                  <Heading4Bold>{t(item.title, { periodName: item.periodName })}</Heading4Bold>
                }
                <ShiftFromTop5>
                  <Heading6>  {formatStringDate(item.notificationDate, luxonLocale)}</Heading6>
                  <Heading6>{
                    getCurrentChildAgeInMonths(
                      t,
                      DateTime.fromJSDate(new Date(item.notificationDate))
                    )}</Heading6>
                  {/* <Heading6>{item.days_from},{item.days_to},{String(item.growth_period)}</Heading6> */}
                </ShiftFromTop5>
                <ShiftFromTop10>
                  <Pressable onPress={() => gotoPage(item.type)}>
                    <ButtonTextSmLineL numberOfLines={2}>{getButtonname(item.type)}</ButtonTextSmLineL>
                  </Pressable></ShiftFromTop10>
              </NotifiContent>

              <NotifAction>
                {(isDeleteEnabled === true) ? (
                  <FormOuterCheckbox
                    onPress={() => {
                      //  console.log(item);
                      setToggleCheckBox(!toggleCheckBox);
                      props.onItemChecked(item, !toggleCheckBox)
                    }}>
                    <CheckboxItem>
                      <View>
                        {toggleCheckBox ? (
                          <CheckboxActive>
                            <Icon name="ic_tick" size={12} color="#000" />
                          </CheckboxActive>
                        ) : (
                          <Checkbox style={{ borderWidth: 1 }}></Checkbox>
                        )}
                      </View>
                    </CheckboxItem>
                  </FormOuterCheckbox>
                ) : (
                  <>
                    <Menu
                      renderer={renderers.ContextMenu}
                      style={{
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onSelect={(value) =>
                        console.log(`Selected number: ${value} ${item}`)
                      }>
                      <MenuTrigger>
                        <Icon
                          style={{
                            flex: 1,
                            textAlign: 'right',
                            alignSelf: 'center',
                          }}
                          name={'ic_kebabmenu'}
                          size={25}
                          color="#000"
                        />
                      </MenuTrigger>
                      <MenuOptions
                        customStyles={{
                          optionsContainer: {
                            marginTop: 30,
                            borderRadius: 10,
                            backgroundColor: primaryTintColor,
                          },

                          optionWrapper: {
                            borderBottomWidth: 1,
                            padding: 15,
                          },

                        }}>
                        <MenuOption value={1} onSelect={() => markAsDelete(item)}>
                          <Heading5Bold>{t('notiOption1')}</Heading5Bold>
                        </MenuOption>
                        <MenuOption value={2} onSelect={() => markAsRead(item)}>
                          <Heading5Bold> {item.isRead == true ? t('notiOption3') : t('notiOption2')}</Heading5Bold>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  </>
                )}
              </NotifAction>

            </FlexDirRowStart>

          </NotificationListContainer>
          <DividerContainer><Divider></Divider></DividerContainer>
        </>) : null)
  }
  const renderVCNotifcation = () => {
    let toDay = DateTime.fromJSDate(new Date());
    let childCrateDate = DateTime.fromJSDate(new Date(activeChild.createdAt));
    // Alert.alert(fromDate + "fromDate")
    // Alert.alert(childCrateDate + "childCrateDate");
    // console.log(childCrateDate, "childCrateDate")
    return (
      (toDay >= item.notificationDate && childCrateDate <= item.notificationDate) ? (item.isDeleted ? null :
        // let fromDate = DateTime.fromJSDate(new Date(activeChild.birthDate)).plus({ days: item.days_from });
        // let childCrateDate = DateTime.fromJSDate(new Date(activeChild.createdAt));
        // return (item.days_from < childAgeInDays && childCrateDate <= fromDate) ? (item.isDeleted ? null : 
        <>
          <NotificationListContainer>
            <FlexDirRowStart>
              <NotifIcon style={{
                backgroundColor: vaccinationColor
              }}>

                <Icon
                  name={geticonname(item.type)}
                  size={20}
                  color="#000"

                />
              </NotifIcon>
              <NotifiContent>
                {item.isRead == true ?
                  <Heading4Regular>{t(item.title, {
                    childName:
                      activeChild.childName != null &&
                        activeChild.childName != '' &&
                        activeChild.childName != undefined
                        ? activeChild.childName
                        : '', periodName: item.periodName
                  })}</Heading4Regular> :
                  <Heading4Bold>{t(item.title, {
                    childName:
                      activeChild.childName != null &&
                        activeChild.childName != '' &&
                        activeChild.childName != undefined
                        ? activeChild.childName
                        : '', periodName: item.periodName
                  })}</Heading4Bold>
                }

                <ShiftFromTop5>
                  <Heading6>  {formatStringDate(item.notificationDate, luxonLocale)}</Heading6>
                  <Heading6>{
                    getCurrentChildAgeInMonths(
                      t,
                      DateTime.fromJSDate(new Date(item.notificationDate))
                    )}</Heading6>
                  {/* <Heading6>{item.days_from},{item.days_to},{String(item.growth_period)}</Heading6> */}
                </ShiftFromTop5>
                <ShiftFromTop10>
                  <Pressable onPress={() => gotoPage(item.type)}>
                    <ButtonTextSmLineL numberOfLines={2}>{getButtonname(item.type)}</ButtonTextSmLineL>
                  </Pressable></ShiftFromTop10>
              </NotifiContent>

              <NotifAction>
                {(isDeleteEnabled === true) ? (
                  <FormOuterCheckbox
                    onPress={() => {
                      //  console.log(item);
                      setToggleCheckBox(!toggleCheckBox);
                      props.onItemChecked(item, !toggleCheckBox)
                    }}>
                    <CheckboxItem>
                      <View>
                        {toggleCheckBox ? (
                          <CheckboxActive>
                            <Icon name="ic_tick" size={12} color="#000" />
                          </CheckboxActive>
                        ) : (
                          <Checkbox style={{ borderWidth: 1 }}></Checkbox>
                        )}
                      </View>
                    </CheckboxItem>
                  </FormOuterCheckbox>
                ) : (
                  <>
                    <Menu
                      renderer={renderers.ContextMenu}
                      style={{
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onSelect={(value) =>
                        console.log(`Selected number: ${value} ${item}`)
                      }>
                      <MenuTrigger>
                        <Icon
                          style={{
                            flex: 1,
                            textAlign: 'right',
                            alignSelf: 'center',
                          }}
                          name={'ic_kebabmenu'}
                          size={25}
                          color="#000"
                        />
                      </MenuTrigger>
                      <MenuOptions
                        customStyles={{
                          optionsContainer: {
                            marginTop: 30,
                            borderRadius: 10,
                            backgroundColor: primaryTintColor,
                          },

                          optionWrapper: {
                            borderBottomWidth: 1,
                            padding: 15,
                          },

                        }}>
                        <MenuOption value={1} onSelect={() => markAsDelete(item)}>
                          <Heading5Bold>{t('notiOption1')}</Heading5Bold>
                        </MenuOption>
                        <MenuOption value={2} onSelect={() => markAsRead(item)}>
                          <Heading5Bold> {item.isRead == true ? t('notiOption3') : t('notiOption2')}</Heading5Bold>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  </>
                )}
              </NotifAction>

            </FlexDirRowStart>

          </NotificationListContainer>
          <DividerContainer><Divider></Divider></DividerContainer>
        </>) : null)
  }

  const renderCDNotifcation = () => {
    //At the beginning of the period =>cd1
    //5 days before the end of the period =>cd2
    //

    // if today;s date childAgeInDays is less= than days_to then only cd2 diplay,
    if (item.title == 'cdNoti1') {
      let toDay = DateTime.fromJSDate(new Date());
      let childCrateDate = DateTime.fromJSDate(new Date(activeChild.createdAt));
      // Alert.alert(fromDate + "fromDate")
      // Alert.alert(childCrateDate + "childCrateDate");
      // console.log(childCrateDate, "childCrateDate")
      return (
        (toDay >= item.notificationDate && childCrateDate <= item.notificationDate) ? item.isDeleted ? null :

          // let fromDate = DateTime.fromJSDate(new Date(activeChild.birthDate)).plus({ days: item.days_from });
          // let childCrateDate = DateTime.fromJSDate(new Date(activeChild.createdAt));
          // return (
          //   (item.days_from <= childAgeInDays && childCrateDate <= fromDate) ? item.isDeleted ? null : 

          (<>
            <NotificationListContainer>
              <FlexDirRowStart>
                <NotifIcon style={{
                  backgroundColor: cdColor
                }}>

                  <Icon
                    name={geticonname(item.type)}
                    size={20}
                    color="#000"

                  />
                </NotifIcon>
                <NotifiContent>
                  {item.isRead == true ?
                    <Heading4Regular>{t(item.title, { periodName: item.periodName })}</Heading4Regular> :
                    <Heading4Bold>{t(item.title, { periodName: item.periodName })}</Heading4Bold>
                  }
                  <ShiftFromTop5>
                    <Heading6>  {formatStringDate(item.notificationDate, luxonLocale)}</Heading6>
                    <Heading6>{
                      getCurrentChildAgeInMonths(
                        t,
                        DateTime.fromJSDate(new Date(item.notificationDate))
                      )}</Heading6>
                    {/* <Heading6>{item.days_from},{item.days_to},{String(item.growth_period)}</Heading6> */}
                  </ShiftFromTop5>
                  <ShiftFromTop10>
                    <Pressable onPress={() => gotoPage(item.type)}>
                      <ButtonTextSmLineL numberOfLines={2}>{getButtonname(item.type)}</ButtonTextSmLineL>
                    </Pressable></ShiftFromTop10>
                </NotifiContent>

                <NotifAction>
                  {(isDeleteEnabled === true) ? (
                    <FormOuterCheckbox
                      onPress={() => {
                        //  console.log(item);
                        setToggleCheckBox(!toggleCheckBox);
                        props.onItemChecked(item, !toggleCheckBox)
                      }}>
                      <CheckboxItem>
                        <View>
                          {toggleCheckBox ? (
                            <CheckboxActive>
                              <Icon name="ic_tick" size={12} color="#000" />
                            </CheckboxActive>
                          ) : (
                            <Checkbox style={{ borderWidth: 1 }}></Checkbox>
                          )}
                        </View>
                      </CheckboxItem>
                    </FormOuterCheckbox>
                  ) : (
                    <>
                      <Menu
                        renderer={renderers.ContextMenu}
                        style={{
                          width: 40,
                          height: 40,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onSelect={(value) =>
                          console.log(`Selected number: ${value} ${item}`)
                        }>
                        <MenuTrigger>
                          <Icon
                            style={{
                              flex: 1,
                              textAlign: 'right',
                              alignSelf: 'center',
                            }}
                            name={'ic_kebabmenu'}
                            size={25}
                            color="#000"
                          />
                        </MenuTrigger>
                        <MenuOptions
                          customStyles={{
                            optionsContainer: {
                              marginTop: 30,
                              borderRadius: 10,
                              backgroundColor: primaryTintColor,
                            },

                            optionWrapper: {
                              borderBottomWidth: 1,
                              padding: 15,
                            },

                          }}>
                          <MenuOption value={1} onSelect={() => markAsDelete(item)}>
                            <Heading5Bold>{t('notiOption1')}</Heading5Bold>
                          </MenuOption>
                          <MenuOption value={2} onSelect={() => markAsRead(item)}>
                            <Heading5Bold> {item.isRead == true ? t('notiOption3') : t('notiOption2')}</Heading5Bold>
                          </MenuOption>
                        </MenuOptions>
                      </Menu>
                    </>
                  )}
                </NotifAction>

              </FlexDirRowStart>

            </NotificationListContainer>
            <DividerContainer><Divider></Divider></DividerContainer>
          </>) : null)
    }
    else {
      let toDay = DateTime.fromJSDate(new Date());
      let childCrateDate = DateTime.fromJSDate(new Date(activeChild.createdAt));
      // Alert.alert(fromDate + "fromDate")
      // Alert.alert(childCrateDate + "childCrateDate");
      // console.log(childCrateDate, "childCrateDate")
      return (
        (toDay >= item.notificationDate && childCrateDate <= item.notificationDate) ? item.isDeleted ? null :

          // let fromDate = DateTime.fromJSDate(new Date(activeChild.birthDate)).plus({ days: item.days_from });
          // let childCrateDate = DateTime.fromJSDate(new Date(activeChild.createdAt));
          // return (
          //   (item.days_from < childAgeInDays && childCrateDate <= fromDate) ? item.isDeleted ? null :
          (<>
            <NotificationListContainer>
              <FlexDirRowStart>
                <NotifIcon style={{
                  backgroundColor: cdColor
                }}>

                  <Icon
                    name={geticonname(item.type)}
                    size={20}
                    color="#000"

                  />
                </NotifIcon>
                <NotifiContent>
                  {item.isRead == true ?
                    <Heading4Regular>{t(item.title, { periodName: item.periodName })}</Heading4Regular> :
                    <Heading4Bold>{t(item.title, { periodName: item.periodName })}</Heading4Bold>
                  }
                  <ShiftFromTop5>
                    <Heading6>  {formatStringDate(item.notificationDate, luxonLocale)}</Heading6>
                    <Heading6>{
                      getCurrentChildAgeInMonths(
                        t,
                        DateTime.fromJSDate(new Date(item.notificationDate))
                      )}</Heading6>
                    {/* <Heading6>{item.days_from},{item.days_to},{String(item.growth_period)}</Heading6> */}
                  </ShiftFromTop5>
                  <ShiftFromTop10>
                    <Pressable onPress={() => gotoPage(item.type)}>
                      <ButtonTextSmLineL numberOfLines={2}>{getButtonname(item.type)}</ButtonTextSmLineL>
                    </Pressable></ShiftFromTop10>
                </NotifiContent>

                <NotifAction>
                  {(isDeleteEnabled === true) ? (
                    <FormOuterCheckbox
                      onPress={() => {
                        //  console.log(item);
                        setToggleCheckBox(!toggleCheckBox);
                        props.onItemChecked(item, !toggleCheckBox)
                      }}>
                      <CheckboxItem>
                        <View>
                          {toggleCheckBox ? (
                            <CheckboxActive>
                              <Icon name="ic_tick" size={12} color="#000" />
                            </CheckboxActive>
                          ) : (
                            <Checkbox style={{ borderWidth: 1 }}></Checkbox>
                          )}
                        </View>
                      </CheckboxItem>
                    </FormOuterCheckbox>
                  ) : (
                    <>
                      <Menu
                        renderer={renderers.ContextMenu}
                        style={{
                          width: 40,
                          height: 40,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onSelect={(value) =>
                          console.log(`Selected number: ${value} ${item}`)
                        }>
                        <MenuTrigger>
                          <Icon
                            style={{
                              flex: 1,
                              textAlign: 'right',
                              alignSelf: 'center',
                            }}
                            name={'ic_kebabmenu'}
                            size={25}
                            color="#000"
                          />
                        </MenuTrigger>
                        <MenuOptions
                          customStyles={{
                            optionsContainer: {
                              marginTop: 30,
                              borderRadius: 10,
                              backgroundColor: primaryTintColor,
                            },

                            optionWrapper: {
                              borderBottomWidth: 1,
                              padding: 15,
                            },

                          }}>
                          <MenuOption value={1} onSelect={() => markAsDelete(item)}>
                            <Heading5Bold>{t('notiOption1')}</Heading5Bold>
                          </MenuOption>
                          <MenuOption value={2} onSelect={() => markAsRead(item)}>
                            <Heading5Bold> {item.isRead == true ? t('notiOption3') : t('notiOption2')}</Heading5Bold>
                          </MenuOption>
                        </MenuOptions>
                      </Menu>
                    </>
                  )}
                </NotifAction>

              </FlexDirRowStart>

            </NotificationListContainer>
            <DividerContainer><Divider></Divider></DividerContainer>
          </>) : null)
    }
  }

  const renderVCReminderNotifcation = () => {

    let toDay = DateTime.fromJSDate(new Date());
    // let childCrateDate = DateTime.fromJSDate(new Date(activeChild.createdAt));
    // Alert.alert(fromDate + "fromDate")
    // Alert.alert(childCrateDate + "childCrateDate");
    // console.log(childCrateDate, "childCrateDate")
    // return (
    //   (toDay >= item.notificationDate && childCrateDate <= item.notificationDate) ? item.isDeleted ? null :

    console.log(item, childAgeInDays, "renderVCReminderNotifcation")
    return (toDay >= item.notificationDate ? item.isDeleted ? null : <>
      <NotificationListContainer>
        <FlexDirRowStart>
          <NotifIcon style={{
            backgroundColor: item.type == 'vcr' ? vaccinationColor : hcheaderColor
          }}>

            <Icon
              name={geticonname(item.type)}
              size={20}
              color="#000"

            />
          </NotifIcon>
          <NotifiContent>
            {item.isRead == true ?
              <Heading4Regular>{t(item.title, {
                reminderDateTime: formatStringDate(item.periodName, luxonLocale) + "," + formatStringTime(item.growth_period, luxonLocale)
              })}</Heading4Regular> :
              <Heading4Bold>{t(item.title, {
                reminderDateTime: formatStringDate(item.periodName, luxonLocale) + "," + formatStringTime(item.growth_period, luxonLocale)
              })}</Heading4Bold>
            }

            <ShiftFromTop5>
              <Heading6>  {formatStringDate(item.notificationDate, luxonLocale)}</Heading6>
              <Heading6>{
                getCurrentChildAgeInMonths(
                  t,
                  DateTime.fromJSDate(new Date(item.notificationDate))
                )}</Heading6>
              {/* <Heading6>{item.days_from},{item.days_to}{"VCR reminder"}</Heading6> */}
            </ShiftFromTop5>
            <ShiftFromTop10>
              <Pressable onPress={() => gotoPage(item.type)}>
                <ButtonTextSmLineL numberOfLines={2}>{getButtonname(item.type)}</ButtonTextSmLineL>
              </Pressable></ShiftFromTop10>
          </NotifiContent>

          <NotifAction>
            {(isDeleteEnabled === true) ? (
              <FormOuterCheckbox
                onPress={() => {
                  //  console.log(item);
                  setToggleCheckBox(!toggleCheckBox);
                  props.onItemChecked(item, !toggleCheckBox)
                }}>
                <CheckboxItem>
                  <View>
                    {toggleCheckBox ? (
                      <CheckboxActive>
                        <Icon name="ic_tick" size={12} color="#000" />
                      </CheckboxActive>
                    ) : (
                      <Checkbox style={{ borderWidth: 1 }}></Checkbox>
                    )}
                  </View>
                </CheckboxItem>
              </FormOuterCheckbox>
            ) : (
              <>
                <Menu
                  renderer={renderers.ContextMenu}
                  style={{
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onSelect={(value) =>
                    console.log(`Selected number: ${value} ${item}`)
                  }>
                  <MenuTrigger>
                    <Icon
                      style={{
                        flex: 1,
                        textAlign: 'right',
                        alignSelf: 'center',
                      }}
                      name={'ic_kebabmenu'}
                      size={25}
                      color="#000"
                    />
                  </MenuTrigger>
                  <MenuOptions
                    customStyles={{
                      optionsContainer: {
                        marginTop: 30,
                        borderRadius: 10,
                        backgroundColor: primaryTintColor,
                      },

                      optionWrapper: {
                        borderBottomWidth: 1,
                        padding: 15,
                      },

                    }}>
                    <MenuOption value={1} onSelect={() => markAsDelete(item)}>
                      <Heading5Bold>{t('notiOption1')}</Heading5Bold>
                    </MenuOption>
                    <MenuOption value={2} onSelect={() => markAsRead(item)}>
                      <Heading5Bold> {item.isRead == true ? t('notiOption3') : t('notiOption2')}</Heading5Bold>
                    </MenuOption>
                  </MenuOptions>
                </Menu>
              </>
            )}
          </NotifAction>

        </FlexDirRowStart>

      </NotificationListContainer>
      <DividerContainer><Divider></Divider></DividerContainer>
    </> : null)
  }

  return (
    (item.type == 'gw' ? renderGrowthNotifcation() : item.type == 'cd' ? renderCDNotifcation() : item.type == 'vc' ? renderVCNotifcation() : item.type == 'hc' ? renderHCNotifcation() : (item.type == 'vcr' || item.type == 'hcr') ? renderVCReminderNotifcation() : null)
  );
};
export default NotificationItem;

