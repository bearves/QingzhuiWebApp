import React from 'react';
import { Card } from 'antd';
import 'antd/dist/antd.css';
import './index.css';

class GaitInfoPresent extends React.Component {

    constructor (props) {
        super(props);
        this.gaitInfo = {
            gaitId: -1,
            gaitName: ""
        };
    }

    updateDataSource() {
        let robotData = this.props.robotData;
        if (!robotData["ROBOT_STATE"]) 
            return;
        this.gaitInfo = {
            gaitId: robotData["ROBOT_STATE"]["gait_id"],
            gaitName: robotData["ROBOT_STATE"]["gait_name"]
        };
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.robotData === nextProps.robotData)
            return false;
        return true;
    }

    render() {
        this.updateDataSource();
        return (
            <Card>
                <div className={"gait-info-card-title"}>Gait Info</div>
                <div className={"gait-info-display-div"}>Gait ID: {this.gaitInfo.gaitId}</div>
                <div className={"gait-info-display-div"}>Gait Name: {this.gaitInfo.gaitName}</div>
            </Card>
        );
    }
}

export {GaitInfoPresent};