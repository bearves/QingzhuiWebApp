import React from 'react';
import 'antd/dist/antd.css';
import './index.css';

class LidarMapPage extends React.Component {

    render () {
        return (
            <div>Lidar Map</div>
        )
    }
}

class CameraPage extends React.Component {

    render () {
        return (
            <div>Camera</div>
        )
    }
}

class HeightMapPage extends React.Component {

    render () {
        return (
            <div>Height Map</div>
        )
    }
}

export {LidarMapPage, CameraPage, HeightMapPage};