import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { S } from '../theme/styles';
import { homeTabIcon, ordersTabIcon, accountTabIcon } from '../components/TabIcon';
import { LoadingScreen } from '../components/LoadingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { ContactUsScreen } from '../screens/ContactUsScreen';
import { LegalDocumentScreen } from '../screens/LegalDocumentScreen';
import type { RootStackParamList, MainTabsParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabsParamList>();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: S.tabBar,
        tabBarActiveTintColor: '#F5821F',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: S.tabBarLabel,
      }}>
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: homeTabIcon }}
      />
      <Tabs.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ tabBarLabel: 'Order', tabBarIcon: ordersTabIcon }}
      />
      <Tabs.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarIcon: accountTabIcon }}
      />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const { session, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
        <Stack.Screen name="LegalDocument" component={LegalDocumentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
