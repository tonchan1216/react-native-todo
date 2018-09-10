import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
  ScrollView,
  FlatList,
  TextInput,
  Button,
  AsyncStorage,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';

import {
  SearchBar
} from "react-native-elements";

const STATUSBAR_HEIGHT = Platform.OS == 'ios' ? 20 : StatusBar.currentHeight;
const TODO = "@todoapp.todo"

//Todoアイテムのコンポーネント
const TodoItem = (props) => {
  let textStyle = styles.todoItem
  if (props.done === true) {
    textStyle = styles.todoItemDone
  }

  return (
    <TouchableOpacity onPress={props.onTapTodoItem}>
      <Text style={textStyle}>{props.title}</Text>
    </TouchableOpacity>
  )
}

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      todo: [],
      currentIndex: 0,
      inputText: "",
      filterText: "",
    }
  }

  componentDidMount() {
    this.loadTodo()
  }

  //ストレージから読み出し
  loadTodo = async () => {
    try {
      const todoString = await AsyncStorage.getItem(TODO)　//非同期処理
      if (todoString) {
        const todo = JSON.parse(todoString)
        const currentIndex = todo.length
        this.setState({ todo: todo, currentIndex: currentIndex })
      }
    } catch (e) {
      console.log(e)
    }
  }

  //ストレージに書き出し
  saveTodo = async (todo) => {
    try {
      const todoString = JSON.stringify(todo)
      await AsyncStorage.setItem(TODO, todoString)　//非同期処理
    } catch (e) {
      console.log(e)
    }
  }

  //アイテム追加時に発火
  onAddItem = () => {
    const title = this.state.inputText
    if (title == "") {
      return //空文字列時はパス
    }

    const index = this.state.currentIndex + 1
    const newTodo = { index: index, title: title, done: false }
    const todo = [...this.state.todo, newTodo]

    this.setState({
      todo: todo,
      currentIndex: index,
      inputText: ""
    })

    this.saveTodo(todo)
  }

  //アイテムタップ時に発火
  onTapTodoItem = (todoItem) => {
    const todo = this.state.todo
    const index = todo.indexOf(todoItem)

    todoItem.done = !todoItem.done //done値を反転
    todo[index] = todoItem
    this.setState({ todo: todo })

    this.saveTodo(todo)
  }

  render() {
    const filterText = this.state.filterText
    let todo = this.state.todo

    //フィルター処理
    if (filterText !== "") {
      todo = todo.filter(t => t.title.includes(filterText))
    }

    const platform = Platform.OS == 'ios' ? 'ios' : 'android'

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <SearchBar
          platform={platform}
          cancelButtonTitle="Cancel"
          onChangeText={(text) => this.setState({ filterText: text })}
          onClear={() => this.setState({ filterText: "" })}
          value={this.state.filterText}
          placeholder="Type filter text"
        />
        <ScrollView style={styles.todolist}>
          <FlatList data={todo}
            extraData={this.state}
            renderItem={({ item }) =>
              <TodoItem
                title={item.title}
                done={item.done}
                onTapTodoItem={() => this.onTapTodoItem(item)}
              />
            }
            keyExtractor={(item, index) => "todo_" + item.index}
          />
        </ScrollView>

        <View style={styles.input}>
          <TextInput
            onChangeText={(text) => this.setState({ inputText: text })}
            value={this.state.inputText}
            style={styles.inputText}
            placeholder="Type new Todo Item"
          />
          <Button
            onPress={this.onAddItem}
            title="Add"
            color="#841584"
            style={styles.inputButton}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: STATUSBAR_HEIGHT,
  },

  filter: {
    height: 30,
    flexDirection: "row"
  },
  todolist: {
    flex: 1,
  },
  input: {
    height: 30,
    flexDirection: "row"
  },
  inputText: {
    flex: 1,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  inputButton: {
    width: 100
  },
  todoItem: {
    fontSize: 20,
    backgroundColor: "white"
  },
  todoItemDone: {
    fontSize: 20,
    backgroundColor: "red"
  },
});
