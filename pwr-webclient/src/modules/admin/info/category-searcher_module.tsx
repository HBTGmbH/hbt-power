import * as React from 'react';
import {SkillCategory} from '../../../model/skill/SkillCategory';
import {AutoComplete, Dialog, List, ListItem, makeSelectable, TextField} from 'material-ui';
import {ReactUtils} from '../../../utils/ReactUtils';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {Comparators} from '../../../utils/Comparators';
import {SkillStore} from '../../../model/skill/SkillStore';
import wrapSelectableList = ReactUtils.wrapSelectableList;


let SelectableList = wrapSelectableList(makeSelectable(List));

interface CategorySearcherProps {
    categories: Array<SkillCategory>;
    open: boolean;
    onRequestClose(): void;
    onSelectCategory(categoryId: number): void;
    skillStore: SkillStore;
}

interface CategorySearcherLocalState {
    selected: number;
    filterText: string;
}


export class CategorySearcher extends React.Component<CategorySearcherProps, CategorySearcherLocalState> {

    constructor(props: CategorySearcherProps) {
        super(props);
        this.state = {
            selected: -1,
            filterText: ''
        };
    }

    componentDidUpdate(oldProps: CategorySearcherProps) {
        if(oldProps.open === false && this.props.open === true) {
            this.setState({
                selected: -1,
                filterText: ''
            })
        }
    }

    private mapListItem = (category: SkillCategory) => {
        return  <ListItem
            value={category.id()}
            key={category.id()}
        >
            <div>
                <span style={{fontWeight: "bold"}}>{category.qualifier()}</span><br/>
                <span style={{fontSize: "10px", fontStyle: "italic"}}>{this.props.skillStore.getInverseCategoryHierarchy(category.id())}</span>
            </div>
        </ListItem>;
    };

    private handleSelect = (event: any, index: number) => {
        this.setState({
            selected: index
        });
        this.props.onSelectCategory(index);
    };

    private handleFilterTextChange = (event: any, value: string) => {
        this.setState({
                filterText: value
        });
    };

    private renderCategories = () => {
        let categories = this.props.categories;
        if(this.state.filterText !== "") {
            categories = categories.filter(category => AutoComplete.fuzzyFilter(this.state.filterText, category.qualifier()));
        }
        categories.sort(Comparators.compareCategories);
        return categories.map(this.mapListItem);
    };

    render() {
        return (<Dialog
            open={this.props.open}
            onRequestClose={this.props.onRequestClose}
        >
            <TextField
                floatingLabelText={PowerLocalize.get("Action.Search")}
                value={this.state.filterText}
                onChange={this.handleFilterTextChange}
            />
            <SelectableList selectedIndex={this.state.selected}
                            onSelect={this.handleSelect}
                            style={{maxHeight: "400px", overflow: "auto"}}
            >
                {this.renderCategories()}
            </SelectableList>
        </Dialog>);
    }
}