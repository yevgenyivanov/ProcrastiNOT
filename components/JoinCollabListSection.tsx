import React, { useEffect, useRef,useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";

interface JoinCollabListSectionProps {
  isVisible: boolean;
  onSubmit: (categoryName: string) => void;
}

const JoinCollabListSection: React.FC<JoinCollabListSectionProps> = ({
  isVisible, onSubmit
}) => {
  const [link, setNewLink] = useState<string>("");
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      expandingAnimation();
    } else {
      collapsingAnimation();
    }
  }, [isVisible]);

  const expandingAnimation = () => {
    opacity.setValue(0);
    Animated.spring(heightAnim, {
      toValue: 200,
      damping: 20,
      useNativeDriver: false,
    }).start();

    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const collapsingAnimation = () => {
    Animated.spring(heightAnim, {
      toValue: 0,
      damping: 20,
      useNativeDriver: false,
    }).start();

    Animated.timing(opacity, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const handleSubmit = () => {
    if(!link) return;
    onSubmit(link);
    setNewLink("");
  };

  return (
    <Animated.View style={[styles.container, { height: heightAnim, opacity }]}>
      <View style={styles.categorySection}>

        <View style={styles.row}>
          <View style={styles.flex}>
            <TextInput
              placeholder="Enter link.."
              keyboardType="default"
              onChangeText={setNewLink}
              value={link}
            />
          </View>
          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent:'center',
    alignItems: 'center',
    width: "100%",
    overflow: 'hidden',
  },
  categorySection: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: "lightgrey",
    margin: 20,
  },
  heading: {
    textAlign: "right",
    marginBottom: 10,
    color: "white",
    opacity: 0.4,
  },
  row: {
    flexDirection: "row",
  },
  flex: {
    flex: 1,
    justifyContent:'center',
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  button: {
    height: 40,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "blue",
    borderRadius: 10,
    marginRight: 5,
  },
  buttonText: {
    color: "white",
  },
});

export default JoinCollabListSection;