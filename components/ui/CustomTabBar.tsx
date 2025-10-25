import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackgroundComp, { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { useThemeMode } from '@/providers/ThemeProvider';

type RouteOptions = BottomTabBarProps['descriptors'][string]['options'];

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const [width, setWidth] = useState(0);
  const tabWidth = width > 0 ? width / state.routes.length : 0;

  const indicatorX = useSharedValue(0);

  const { preset } = useThemeMode();
  let activeTint = Colors[colorScheme].tint;
  if (preset === 'highContrast') {
    activeTint = '#ffd400';
  } else if (preset === 'amoled' && colorScheme === 'dark') {
    activeTint = '#22d3ee';
  }
  const inactiveTint = Colors[colorScheme].tabIconDefault;

  useEffect(() => {
    indicatorX.value = withTiming(state.index * tabWidth, { duration: 300 });
  }, [state.index, tabWidth, indicatorX]);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <ThemedView style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]} onLayout={onLayout}>
      {typeof TabBarBackgroundComp === 'function' ? <TabBarBackgroundComp /> : null}
      <View style={styles.row}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            { width: Math.max(tabWidth - 24, 56) },
            colorScheme === 'dark' ? styles.indicatorDark : styles.indicatorLight,
            indicatorStyle,
          ]}
        />
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onPressIn = () => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const Icon = options.tabBarIcon as RouteOptions['tabBarIcon'];

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onPressIn={onPressIn}
              onLongPress={onLongPress}
              style={[styles.tab, { width: tabWidth }]}
            >
              {Icon ? (
                Icon({ color: focused ? activeTint : inactiveTint, size: 24, focused })
              ) : (
                <IconSymbol name="chevron.right" color={focused ? activeTint : inactiveTint} size={24} />
              )}
              <View style={{ height: 4 }} />
              <Animated.Text
                style={[
                  styles.label,
                  { color: focused ? activeTint : inactiveTint },
                ]}
              >
                {String(label)}
              </Animated.Text>
            </Pressable>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(127,127,127,0.3)',
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  tab: {
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    height: 36,
    borderRadius: 18,
    left: 12,
  },
  indicatorLight: {
    backgroundColor: 'rgba(10, 126, 164, 0.15)',
  },
  indicatorDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});