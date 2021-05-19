import React from 'react';
import {View, Text, Button} from 'react-native';

const CustomDrawerContent = ({navigation}: any) => {
  const [accordvalue, onChangeaccordvalue] = React.useState(false);

  return (
    <View>
      <Text>CustomDrawerContent screen</Text>
      <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
      <Button
        title="Go to NotificationsScreen"
        onPress={() => navigation.navigate('NotificationsScreen')}
      />
      <Button
        title="Open Tools"
        onPress={() => onChangeaccordvalue(!accordvalue)}
      />
      {accordvalue ? (
        <>
          <Button
            title="Go to ChildGrowth"
            onPress={() => navigation.navigate('ChildgrowthScreen')}
          />
          <Button
            title="Go to ChildDevelopment"
            onPress={() => navigation.navigate('ChildDevelopmentScreen')}
          />
          <Button
            title="Go to Vaccination"
            onPress={() => navigation.navigate('VaccinationScreen')}
          />
          <Button
            title="Go to HealthCheckups"
            onPress={() => navigation.navigate('HealthCheckupsScreen')}
          />
        </>
      ) : null}

      <Text>Favourites</Text>
      <Text>About us</Text>
      <Text>User Guide</Text>
      <Button
        title="Go to Settings"
        onPress={() => navigation.navigate('SettingsScreen')}
      />
      <Text>Share The App</Text>
      <Text>Feedback</Text>
      <Text>Love the App? Rate it</Text>
    </View>
  );
};

export default CustomDrawerContent;
