import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

CSV_PATH = 'results/algo_recourse_results.csv'

# Read the CSV data from the file
try:
    df = pd.read_csv(CSV_PATH)
except FileNotFoundError:
    print("Error: 'algo_recourse_results.csv' not found.")
    print("Please make sure the file is in the same directory as the script.")
    exit()

# Hard-code scenario groups based on row position
# Every 10 rows corresponds to one scenario group in order: 1, 10, 2, 3, 4, 5, 6, 7, 8, 9
scenario_group_order = [1, 10, 2, 3, 4, 5, 6, 7, 8, 9]

def assign_scenario_group(row_index):
    """Assigns scenario group based on row position (every 10 rows = 1 group)."""
    group_index = row_index // 10  # Integer division to get group number
    if group_index < len(scenario_group_order):
        return f"Scenario {scenario_group_order[group_index]}"
    else:
        # If we have more rows than expected, assign to the last group
        return f"Scenario {scenario_group_order[-1]}"

# Create scenario group column based on row index
df['scenario_group'] = df.index.map(assign_scenario_group)

# Group by scenario and sum the outcomes
grouped_outcomes = df.groupby('scenario_group')[['side_a_outcome', 'side_b_outcome']].sum()

# Define the expected order of scenario groups (as they appear in groups of 10 rows)
expected_order = [f"Scenario {i}" for i in scenario_group_order]

# Ensure all expected scenarios are present (fill with zeros if missing)
for scenario in expected_order:
    if scenario not in grouped_outcomes.index:
        grouped_outcomes.loc[scenario] = [0, 0]

# Reindex with the expected order
grouped_outcomes = grouped_outcomes.reindex(expected_order)

# Convert to categorical with explicit ordering
grouped_outcomes.index = pd.Categorical(grouped_outcomes.index, categories=expected_order, ordered=True)

# --- Enhanced Categorical Visualization ---

# Set a more modern plot style
plt.style.use('seaborn-v0_8-whitegrid')

# Create the figure with larger size for better readability
fig, ax = plt.subplots(figsize=(14, 8))

# Define categorical positions
x_pos = np.arange(len(grouped_outcomes.index))
width = 0.6  # Bar width

# Create colors for better distinction
colors = ['#3498db', '#e74c3c']  # Blue for Side A, Red for Side B

# Create the stacked bars
bars1 = ax.bar(x_pos, grouped_outcomes['side_a_outcome'], 
               width, label='Side A Outcome', color=colors[0], alpha=0.8)
bars2 = ax.bar(x_pos, grouped_outcomes['side_b_outcome'], 
               width, bottom=grouped_outcomes['side_a_outcome'], 
               label='Side B Outcome', color=colors[1], alpha=0.8)

# Customize the plot for categorical data
ax.set_xlabel('Scenario Groups', fontsize=14, fontweight='bold')
ax.set_ylabel('Total Wins', fontsize=14, fontweight='bold')
ax.set_title('Side A vs. Side B Outcomes', 
             fontsize=16, fontweight='bold', pad=20)

# Set categorical x-axis
ax.set_xticks(x_pos)
ax.set_xticklabels(grouped_outcomes.index, rotation=45, ha='right')

# Add value labels on bars for better readability
for i, (bar1, bar2) in enumerate(zip(bars1, bars2)):
    # Label for Side A
    height1 = bar1.get_height()
    if height1 > 0:
        ax.text(bar1.get_x() + bar1.get_width()/2., height1/2,
                f'{int(height1)}', ha='center', va='center', 
                fontweight='bold', color='white')
    
    # Label for Side B
    height2 = bar2.get_height()
    if height2 > 0:
        ax.text(bar2.get_x() + bar2.get_width()/2., height1 + height2/2,
                f'{int(height2)}', ha='center', va='center', 
                fontweight='bold', color='white')

# Set fixed y-axis range from 0 to 10
ax.set_ylim(0, 10)

# Add legend with better positioning
ax.legend(loc='upper right', fontsize=12, framealpha=0.9)

# Add grid for better readability
ax.grid(axis='y', alpha=0.3)
ax.set_axisbelow(True)

# Adjust layout
plt.tight_layout()

# Save the enhanced plot
plt.savefig('scenario_outcomes_categorical.png', dpi=300, bbox_inches='tight')
print("Enhanced categorical chart saved as 'scenario_outcomes_categorical.png'")

# Display summary statistics
print("\n" + "="*50)
print("CATEGORICAL SCENARIO ANALYSIS")
print("="*50)
print(f"Number of scenario groups: {len(grouped_outcomes)}")
print(f"Scenario group order (every 10 rows): {scenario_group_order}")
print(f"Total rows in CSV: {len(df)}")
print(f"Rows per scenario group: 10")
print("\nGrouped Data (Hard-coded Categorical Order):")
print(grouped_outcomes)

# Additional categorical analysis
print("\nScenario Group Statistics:")
total_outcomes = grouped_outcomes.sum(axis=1)
non_zero_scenarios = total_outcomes[total_outcomes > 0]
if len(non_zero_scenarios) > 0:
    print(f"Highest total outcomes: {total_outcomes.idxmax()} ({total_outcomes.max()})")
    print(f"Lowest total outcomes (non-zero): {non_zero_scenarios.idxmin()} ({non_zero_scenarios.min()})")
print(f"Empty scenario groups: {len(total_outcomes[total_outcomes == 0])}")

# Show which rows belong to which scenario groups
print(f"\nRow assignments:")
for i, group in enumerate(scenario_group_order):
    start_row = i * 10
    end_row = min((i + 1) * 10 - 1, len(df) - 1)
    actual_rows = len(df[df['scenario_group'] == f'Scenario {group}'])
    print(f"Scenario {group}: Rows {start_row}-{end_row} ({actual_rows} rows with data)")

# Show the plot
plt.show()