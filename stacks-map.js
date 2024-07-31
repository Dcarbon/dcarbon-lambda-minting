module.exports = {
    'AWS::DynamoDB::Table': { destination: 'Dynamodb' },
    'AWS::Logs::LogGroup': { destination: 'LogGroup' },
    'AWS::Lambda::Function': { destination: 'Function' },
    'AWS::Lambda::Version': { destination: 'Version' },
}