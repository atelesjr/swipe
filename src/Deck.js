import React, { Component } from 'react'
import { 
    Animated, 
    View, 
    PanResponder,
    Dimensions,
    LayoutAnimation,
    UIManager
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250; //miliseconds 1000 = 1s

export default class Deck extends Component {
    static defaultProps = {
        onSwipeRight: () => { },
        onSwipeLeft: () => {}
    }
    
    constructor(props){
        super(props);

        const position = new Animated.ValueXY()

        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () =>  true ,
            onPanResponderMove: (event, gesture) => { 
                position.setValue({
                    x: gesture.dx,
                    y: gesture.dy
                })
              }, 
            onPanResponderRelease: (event, gesture) => { 
                if(gesture.dx > SWIPE_THRESHOLD){
                    this.forceSwipe('right');
                } else if (gesture.dx < -SWIPE_THRESHOLD){
                    this.forceSwipe('left')
                }else{
                    this.resetPosition();
                }  
            }
        });
        this.state = { panResponder, position, index: 0 }; //never use setState.
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.setState({ index: 0 });
        }
    }

    componentWillUpdate() {
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.spring();
    }

    forceSwipe(direction){
        Animated.timing(this.state.position, {
            toValue: {
                x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
                y: 0 },
            duration: SWIPE_OUT_DURATION 
        }).start( () => this.OneSwipeCompleted(direction))
    }

    OneSwipeCompleted(direction) {
        const { onSwipeLeft, onSwipeRight, data } = this.props
        const item = data[this.state.index]

        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
        this.state.position.setValue({ x: 0 , y: 0  })
        this.setState({ index: this.state.index + 1 })
    }


    resetPosition() {
        Animated.spring(this.state.position, {
            toValue: { x: 0, y: 0 }
        }).start()
    }

    getCardsStyle(){
        const { position } = this.state;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
            outputRange: ['-120deg', '0deg', '120deg']
        })
        return{
            ...position.getLayout(),
            transform: [{ rotate }]
        }
    }

    renderCards(){

        if ( this.state.index >= this.props.data.length ){
            return this.props.renderNoMoreCards();
        }
      
        return this.props.data.map( (item, i) => {
            //console.log('index', this.state.index)
            //console.log('i', i)
            if (i < this.state.index) { return null; };

            if (i === this.state.index ){
                return(
                    <Animated.View
                        key={item.id}
                        style={ [this.getCardsStyle(), styles.cardStyle,  { zIndex: 99 } ]}
                        { ...this.state.panResponder.panHandlers }
                    >
                        { this.props.renderCard(item) }
                    </Animated.View>
                );
            };

            return (
                <Animated.View
                    style={ styles.cardStyle } 
                    key={item.id}
                    style={[
                        styles.cardStyle, 
                        { top: 10 * (i - this.state.index), zIndex: 5 }]
                    }
                >
                    { this.props.renderCard(item) }
                </Animated.View>
            );
        }).reverse();
        
    };


    render() {
      
        return (
            <View>
                { this.renderCards() }
            </View>
        )
    }
}

const styles = {
    cardStyle : {
        position: 'absolute',
        width: SCREEN_WIDTH
    }
};


/*
** PanDresponder properties
dx, dy: Total distances that user move fingers in a single gesture <click>..<letitgo>
movex, movey: when user press over
vx, vy: speed unitis of move over
x0, y0: similar to moveX and move Y
numberActiveTouches: number press down


** Functional componentes

import React, { useMemo, useState } from "react";
import { View, Animated, PanResponder } from "react-native";
 
const Deck = ({ data, renderCard }) => {
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gesture) => {
          console.log({ ...gesture });
        },
        onPanResponderRelease: () => {}
      }),
    []
  );
 
  const renderCards = () => data.map(item => renderCard(item));
 
  return <View {...panResponder.panHandlers}>{renderCards()}</View>;
};
 
export default Deck;

*/