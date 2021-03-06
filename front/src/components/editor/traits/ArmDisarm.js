import React from 'react';

class ArmDisarm extends React.Component {
  constructor(props) {
    super(props);
    this.updateSecurityLevel = this.updateSecurityLevel.bind(this);
    this.addSecurityLevel = this.addSecurityLevel.bind(this);
  }

  updateSecurityLevel(event){
    const id = event.target.id.split('_')
    const level_id = id[1]
    //Process the attribute and value depending of the attribute
    const level_attribute = id[0] === 'lang' ? id[0] : 'level_synonym';
    const value = id[0] === 'lang' ? event.target.value : event.target.value.split(',')
    //Update the temporal data and update it
    var temp_availableArmLevels = this.props.attributes.availableArmLevels
    temp_availableArmLevels.levels[level_id].level_values[0][level_attribute] = value
    if (id[0] === 'names') temp_availableArmLevels.levels[level_id].level_name = value[0]
    this.props.update('attributes/availableArmLevels', temp_availableArmLevels);
  }

  addSecurityLevel(){
    var temp_availableArmLevels = this.props.attributes.availableArmLevels
    temp_availableArmLevels.levels.push({
      "level_name": "",
      "level_values": [
        {
          "level_synonym": [""],
          "lang": "en"
        }
      ]
    });
    this.props.update('attributes/availableArmLevels', temp_availableArmLevels);
  }

  render() {

    const names_box = {
      marginLeft: '20px',
      width: '150px'
    }

    const levels = this.props.attributes.availableArmLevels.levels.map((level, i) => {
      return (
              <div key={i}>
                <div className="two_table_row" key={i}>
                  <div className="two_table_cel">
                  </div>
                  <div className="two_table_cel">
                    <label>
                      <span>Languaje: </span>
                      <select name="type" id={"lang_" + i} value={level.level_values[0].lang} onChange={this.updateSecurityLevel}>
                        <option value="es">es</option>
                        <option value="en">en</option>
                      </select>
                    </label>
                    <label>
                      <span>Level name: </span>
                      <input type="text" id={"names_" + i} style={names_box} defaultValue={level.level_values[0].level_synonym} placeholder="Security level name" onChange={this.updateSecurityLevel}/>
                    </label>
                  </div>
                </div>
              </div>
              )
    });

    return (
      <div>

        <div className="three_table_row">
          <div className="three_table_cel align_right">
            Add a security level
          </div>
          <div className="three_table_cel">
            <button type="button" className="add_attribute_button" onClick={ this.addSecurityLevel }>Add</button>
          </div>
        </div>

        {levels}

      </div>
    );
  }
}

export default ArmDisarm
