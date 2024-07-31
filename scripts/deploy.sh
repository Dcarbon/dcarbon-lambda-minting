#!/bin/bash
BUILD_MODE=
SERVICE=
LOG_JENKINS=
TELEGRAM_BOT_TOKEN=
TELEGRAM_GROUP_ID=
EV=
WORKSPACE=
TELEGRAM_TOPIC_ID=
while getopts "a:b:c:d:e:g:i:k:h:" opt
do
   # shellcheck disable=SC2220
   case "$opt" in
      a ) BUILD_MODE="$OPTARG" ;;
      b ) SERVICE="$OPTARG" ;;
      c ) LOG_JENKINS="$OPTARG" ;;
      d ) TELEGRAM_BOT_TOKEN="$OPTARG" ;;
      e ) TELEGRAM_GROUP_ID="$OPTARG" ;;
      g ) EV="$OPTARG" ;;
      i ) WORKSPACE="$OPTARG" ;;
      k ) ENV_DEPLOY_PATH="$OPTARG" ;;
      h ) TELEGRAM_TOPIC_ID="$OPTARG" ;;
   esac
done
SERVICE_UPPERCASE=`echo $SERVICE | tr 'a-z' 'A-Z'`
EV_UPPERCASE=`echo $EV | tr 'a-z' 'A-Z'`
ARR_LOG_JENKINS=(${LOG_JENKINS//job/ })
LOG_JENKINS="/job${ARR_LOG_JENKINS[1]}"
function pushTelegramNotification() {
  echo $1
  echo $2
  echo $3
  if [ "$1" == "ERROR" ]; then
     MSG="❌ $SERVICE_UPPERCASE $2

$3"
  elif [ "$1" == "SUCCESS" ]; then
     MSG="✅ $SERVICE_UPPERCASE $2

$3"
  else
    MSG="🟡 $SERVICE_UPPERCASE $2

$3"
  fi
  echo $MSG
  MSG=${MSG//</(}
  MSG=${MSG//>/)}
  MSG=$(urlencode "$MSG")
  curl --location --request GET "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendmessage?chat_id=$TELEGRAM_GROUP_ID&message_thread_id=$TELEGRAM_TOPIC_ID&parse_mode=HTML&text=<code>$MSG</code>"
    if [ "$1" == "ERROR" ]; then
      exit 1;
      fi
}

urlencode() {
  python3 -c 'from urllib.parse import quote, sys; print(quote(sys.argv[1], sys.argv[2]))' \
    "$1" "$urlencode_safe"
}
TELEGRAM_MESSAGE="MODE: $EV_UPPERCASE
BUILD MODE: $BUILD_MODE
BUILD LOG: "$LOG_JENKINS'console'"

- COMMIT INFO

BRANCH: $(git name-rev --name-only HEAD)
COMMIT: $(git log -2)"
pushTelegramNotification "DOING" " is being deployed" "$TELEGRAM_MESSAGE"
export $(egrep -v '^#' "/my-app/env/$EV/common/.env.deploy" | xargs)

npm i
if [ "$?" -eq 0 ]; then
   echo "---NPM INSTALL DONE---"
else
  echo "---NPM INSTALL ERROR---"
  pushTelegramNotification "ERROR" "deployment errors: NPM INSTALL ERROR" "$TELEGRAM_MESSAGE"
fi

aws configure set aws_access_key_id $AWS_ACCESS_KEY
aws configure set aws_secret_access_key $AWS_SECRET_KEY
aws configure set default.region $AWS_REGION
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_FAMILY"
if [ "$?" -eq 0 ]; then
   echo "---AWS CONFIGURE DONE---"
else
  echo "---AWS CONFIGURE ERROR---"
  pushTelegramNotification "ERROR" "deployment errors: AWS CONFIGURE ERROR" "$TELEGRAM_MESSAGE"
fi
# deploy
sls deploy --stage $EV
if [ "$?" -eq 0 ]; then
   echo "---SLS DEPLOY DONE---"
else
  echo "---SLS DEPLOY ERROR---"
  pushTelegramNotification "ERROR" "deployment error: SLS DEPLOY ERROR" "$TELEGRAM_MESSAGE"
fi
removeDeployEnv
pushTelegramNotification "SUCCESS" "deployment successful" "$TELEGRAM_MESSAGE"