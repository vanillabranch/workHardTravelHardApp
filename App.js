import {StatusBar} from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView, Alert, Platform
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Fontisto} from "@expo/vector-icons";
import {theme} from './color';
/*expo install @react-native-async-storage/async-storage 저장전 패키지 설치*/
/*expo install 은 npm install과 같은 동작을 하는데, expo install을 하면 현재 사용중인 expo버전과 동일한 모듈을 설치해주는 차이점이 있다.*/
/*
* 코드 챌린지 1
- 내가 마지막에 닫은 탭 기억하기
- 체크박스와 완료처리(삭선)
- 이미 완료된 내역을 직접 수정할수 있게 해줘야 함.(쓰레기 아이콘 옆)
* */
const STORAGE_KEY = "@toDos";

export default function App() {
    const [working, setWorking] = useState(true);
    const [text, setText] = useState("");
    const [toDos, setToDos] = useState({});

    useEffect(() => {
        loadToDos();
    }, []);

    const travel = () => setWorking(false);
    const work = () => setWorking(true);
    const onChangeText = (payload) => setText(payload);
    /*리액트에서는 절대 useState의 첫번째 값인 value를 직접수정할수 없고, 허용하지 않는다.*/
    /*한가지, 오브젝트 만들기 재미난거,  const test = {}; test[Date.now()] = {work:"testing"}; test하면, 해당 id로 값이 나옴. */
    const addToDo = async () => {
        //submit시 아무것도 입력이 안되어있으면 return 은 당연,
        if (text === "") {
            return;
        }

        //만약 값이 있다면? 새로운 오브젝트(객체)를 만들어 주는데, 기존에 있던 toDos와 함께 새로운 키와 밸류로 결합해준다 넣어준다.
        const newToDos = {
            ...toDos,
            [Date.now()]: {text, working},
        };
        
        //위에서 만들어진(기존+신규) 그리고 다시 셋팅!
        setToDos(newToDos);
        //이걸 스토리지에 저장
        saveToDos(newToDos);
        setText("");
        //★키 값이 제멋대로 여도, map을 이용해서 뽑을수 있는거... 잊지말자 ★★★★★★★★★★
        //Object.keys  배열받환 하는거 이거 잘 기억해서 활용!
    };
    const saveToDos = async (toSave) => {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    };
    const loadToDos = async () => {
        try {
            const s = await AsyncStorage.getItem(STORAGE_KEY);
            if(s){
                setToDos(JSON.parse(s));
            }

        } catch (e) {

        }
    };

    //delete 키워드로 오브젝트의 값을 지울수 있는건가, 잘 기억할것.!
    const deleteToDo = async (key) => {
        //웹인지, 앱인지 구분!
        if(Platform.OS === "web"){
            const ok = confirm("Do you want to delete this To Do");
            if(ok){
                const newToDos = {...toDos};
                delete newToDos[key];
                setToDos(newToDos);
                await saveToDos(newToDos);
            }
        }else{
            Alert.alert(
                "Delete To Do?",
                "Are you sure?", [
                    {text: "Cancel"},
                    {
                        text: "I`m sure", onPress: async () => {
                            const newToDos = {...toDos};
                            delete newToDos[key];
                            setToDos(newToDos);
                            await saveToDos(newToDos);
                        }
                    }
                ]);
        }


    };

    //console.log(toDos);
    //View는 div, Text는 span 등등 태그랑 연동해서 생각하면 쉽다.
    //app.json은 내가 원하는 앱을 만들기 위한, 기초작업 하는곳,,? 파비콘이나 안드로이드, ios다 설정할수 있고, 자세한건 문서를 참고해라.
    //웹,안드로이드, ios 다된다~ asset폴더를 잘 보면 이미지들 들어있음!
    //Alert 객체같은건 웹에서 안되기 때문에 platform api를 활용해 볼수있다. 어디서 실행되는지..알아내는것이지.
    return (
        <View style={styles.container}>
            <StatusBar style="auto"/>
            <View style={styles.header}>
                <TouchableOpacity onPress={work}>
                    <Text style={{
                        fontSize: 38,
                        fontWeight: "600",
                        color: working ? "white" : theme.grey}}>Work</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={travel}>
                    <Text style={{
                        fontSize: 38,
                        fontWeight: "600",
                        color: !working ? "white" : theme.grey}}>Travel</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                onSubmitEditing={addToDo}
                returnKeyType="done"
                onChangeText={onChangeText}
                style={styles.input}
                value={text}
                placeholder={working ? "Add a To Do" : "Where do you want to go?"}
            />
            <ScrollView>
                {Object.keys(toDos).map((key) => (
                    toDos[key].working === working ?
                        <View style={styles.toDo} key={key}>
                            <Text style={styles.toDoText}>{toDos[key].text}</Text>
                            <TouchableOpacity onPress={() => deleteToDo(key)}>
                                    <Fontisto name="trash" size={18} color={theme.grey}/>
                            </TouchableOpacity>
                        </View> : null
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.bg,
        paddingHorizontal: 20
    },
    header: {
        flexDirection: "row",
        marginTop: 100,
        justifyContent: "space-between"
    },
    input: {
        backgroundColor: "white",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 30,
        marginTop: 20,
        marginBottom: 20,
        fontSize: 18
    },
    toDo: {
        backgroundColor: theme.toDoBg,
        marginBottom: 10,
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    toDoText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    }
});
/*
* #expo publish
* 완료되면 서버 화면에서 publish할수 있고, 개인 url이 발급됨.
* 남들과 공유하고 공개적으로 ...
* 
* 다만들면 expo build:android  나  expo build:ios  ㄱㄱ
* 
* 그리고 pc에서 동작하게 하는 React Native for Windows+ macOS 도 있다
* VIRO REACT 도 있다.. 대박..VR앱..
* #4.2 Building for App Stores (10:00)
* https://nomadcoders.co/react-native-for-beginners/lectures/3141  강의를 참조하면 앱,웹,사이트 일괄 배포하는것을 배울수있음. github-pages.
* 3개의 플랫폼을 가질수 있는 방법!
*
* 하지만, expo만을 사용할땐 블루투스 같은 것들을 제어하거나,고급기능, 기타 라이브러리(안드로이드 설정이 필요한)등은 설치할수 없다.
* 모든 인프라스트럭쳐를 expo가 제어하고 있기 때문이다.
* 이건 타협이 필요한 부분이다.
* 그리고 facebook sdk뿐만 아니라 기본적으로 깔고가는 sdk들이 있어서 정말 간단한 앱이어도 용량이 굉장히 커진다는 단점이 있다.(이건 못 건드린다)
*
* 그래서 eject를 이용해서 expo에서 꺼내버릴수 있다. package.json에 있음. 하지만 별로 권장안하고, create-react-navive-app 을 사용..하자..
* */